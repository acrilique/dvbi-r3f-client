import {
  ProgramRepresentation,
  LocalizedString,
  ParentalRating,
  CreditItem,
  KeywordItem,
  AccessibilityAttributes, // This will be provided by xmlParserUtils if parseTVAAccessibilityAttributes is used
  MediaRepresentation, // This will be provided by xmlParserUtils if getMedia is used
} from "../store/types";
import {
  getChildElements,
  getChildElement,
  getChildValue,
  getMedia,
  parseTVAAccessibilityAttributes,
  elementLanguage, // Used by getLocalizedTexts
} from "../utils/xmlParserUtils";

// --- Constants ---
// Fallback namespace for getElementsByTagNameNS when a specific one isn't required (wildcard)
const WILDCARD_NS = "*"; // This can remain if local helpers still use it, or be removed if all helpers use undefined for wildcard
// HowRelated URN for Program Image (TVA)
const TVA_Program_Image_HowRelated_href =
  "urn:tva:metadata:cs:HowRelatedCS:2012:19"; // As per task C.3

// Helper to get a single child element's text content
const getChildElementText = (
  element: Element | null,
  tagName: string,
  namespace: string | undefined, // Updated to accept undefined
): string | undefined => {
  if (!element) return undefined;
  const child = element.getElementsByTagNameNS(
    namespace || WILDCARD_NS,
    tagName,
  )?.[0];
  return child?.textContent?.trim();
};

// Helper to get multiple localized strings from elements like <Title lang="eng">...</Title>
const getLocalizedTexts = (
  parentElement: Element | null,
  tagName: string,
  namespace: string | undefined, // Updated to accept undefined
): LocalizedString[] => {
  if (!parentElement) return [];
  const results: LocalizedString[] = [];
  const elements = parentElement.getElementsByTagNameNS(
    namespace || WILDCARD_NS,
    tagName,
  );
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const lang = elementLanguage(el); // Use elementLanguage helper
    const text = el.textContent?.trim();
    if (text) {
      results.push({ lang, text });
    }
  }
  return results;
};

// Helper to parse ParentalRating elements
const parseParentalRatings = (
  programInfoElement: Element,
  tvaNamespace: string | undefined, // Updated to accept undefined
): ParentalRating[] => {
  const ratings: ParentalRating[] = [];
  const parentalGuidanceElements = programInfoElement.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "ParentalGuidance",
  );
  for (let i = 0; i < parentalGuidanceElements.length; i++) {
    const guidanceElement = parentalGuidanceElements[i];
    const minimumAgeElement = guidanceElement.getElementsByTagNameNS(
      tvaNamespace || WILDCARD_NS,
      "MinimumAge",
    )?.[0];
    const ratingSystem = guidanceElement
      .getElementsByTagNameNS(
        tvaNamespace || WILDCARD_NS,
        "ParentalRating",
      )?.[0]
      ?.getAttribute("href");

    if (minimumAgeElement?.textContent) {
      ratings.push({
        scheme: ratingSystem ?? undefined,
        minimumage: parseInt(minimumAgeElement.textContent, 10),
      });
    } else if (ratingSystem) {
      // Handle cases where only system is defined
      ratings.push({ scheme: ratingSystem ?? undefined });
    }
  }
  return ratings;
};

// Parses a single <ProgramInformation> or <ScheduleEvent> like element into ProgramRepresentation
const mapXmlToProgramRepresentation = (
  progElement: Element,
  cridNamespace: string | undefined, // Updated to accept undefined
  tvaNamespace: string | undefined, // Updated to accept undefined
): ProgramRepresentation | null => {
  const programId =
    progElement.getAttribute("programId") ||
    getChildElementText(progElement, "InstanceMetadataId", cridNamespace) || // cridNamespace will be undefined
    "";
  if (!programId) return null; // Essential identifier

  const titles = getLocalizedTexts(progElement, "Title", tvaNamespace); // tvaNamespace will be undefined
  if (titles.length === 0) return null; // Essential information

  // Published start and end times (UTC)
  // For ProgramInformation, this might be in <PublishedStartTime> and <PublishedDuration>
  // For ScheduleEvent, this is <PublishedStartTime> and <PublishedEndTime> or <PublishedDuration>
  let startTimeEpoch: number | undefined;
  let endTimeEpoch: number | undefined;

  const basicDescription = progElement.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "BasicDescription",
  )?.[0];
  if (!basicDescription) return null; // BasicDescription is crucial for many fields

  const synopsisElements = basicDescription.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "Synopsis",
  );
  let description: string | undefined;
  if (synopsisElements.length > 0) {
    // Prefer synopsis with length="long" or "medium", fallback to first
    let chosenSynopsis: Element | undefined;
    for (let i = 0; i < synopsisElements.length; i++) {
      const syn = synopsisElements[i];
      if (syn.getAttribute("length") === "long") {
        chosenSynopsis = syn;
        break;
      }
      if (syn.getAttribute("length") === "medium" && !chosenSynopsis) {
        chosenSynopsis = syn;
      }
    }
    if (!chosenSynopsis && synopsisElements.length > 0)
      chosenSynopsis = synopsisElements[0];
    description = chosenSynopsis?.textContent?.trim();
  }

  const programInfoTable = progElement.closest("ProgramLocationTable"); // closest doesn't use namespace
  const scheduleEvent = progElement.closest("ScheduleEvent"); // closest doesn't use namespace

  if (scheduleEvent) {
    // Typically from a <Schedule> context
    const startTimeStr = getChildElementText(
      scheduleEvent,
      "PublishedStartTime",
      tvaNamespace, // tvaNamespace will be undefined
    );
    const durationStr = getChildElementText(
      scheduleEvent,
      "PublishedDuration",
      tvaNamespace, // tvaNamespace will be undefined
    );
    const endTimeStr = getChildElementText(
      scheduleEvent,
      "PublishedEndTime",
      tvaNamespace, // tvaNamespace will be undefined
    );

    if (startTimeStr) {
      startTimeEpoch = new Date(startTimeStr).getTime();
      if (durationStr) {
        // ISO 8601 duration (e.g., PT1H30M)
        const durationParts = durationStr.match(
          /PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/,
        );
        if (durationParts) {
          const hours = parseInt(durationParts[1] || "0", 10);
          const minutes = parseInt(durationParts[2] || "0", 10);
          const seconds = parseFloat(durationParts[3] || "0");
          endTimeEpoch =
            startTimeEpoch + (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
      } else if (endTimeStr) {
        endTimeEpoch = new Date(endTimeStr).getTime();
      }
    }
  } else if (programInfoTable) {
    // Typically from a <ProgramInformationTable> context (Now/Next)
    // For now/next, start/end times might be relative or need context from the query
    // This part might need more sophisticated logic based on how the Now/Next feed is structured
    // For a simple case, let's assume PublishedStartTime and PublishedDuration are directly under ProgramInformation
    const startTimeStr = getChildElementText(
      progElement,
      "PublishedStartTime",
      tvaNamespace, // tvaNamespace will be undefined
    );
    const durationStr = getChildElementText(
      progElement,
      "PublishedDuration",
      tvaNamespace, // tvaNamespace will be undefined
    );
    if (startTimeStr) {
      startTimeEpoch = new Date(startTimeStr).getTime();
      if (durationStr) {
        const durationParts = durationStr.match(
          /PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/,
        );
        if (durationParts) {
          const hours = parseInt(durationParts[1] || "0", 10);
          const minutes = parseInt(durationParts[2] || "0", 10);
          const seconds = parseFloat(durationParts[3] || "0");
          endTimeEpoch =
            startTimeEpoch + (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
      }
    }
  }

  if (startTimeEpoch === undefined || endTimeEpoch === undefined) {
    // console.warn('Could not determine start/end time for program:', programId);
    return null; // Or handle as an ongoing program if context allows
  }

  const parentalRatings = parseParentalRatings(basicDescription, tvaNamespace); // tvaNamespace will be undefined

  // CPSIndex is expected as a direct child of ProgramInformation, using wildcard namespace
  // as per reference client (DVBi_ns for <CPSIndex>).
  const cpsIndex = getChildElementText(progElement, "CPSIndex", undefined);

  // bilingual, channelImage, channelStreamUrl are not typically part of ProgramInformation XML
  // and would be part of ChannelRepresentation or derived differently.

  // --- Start: New field parsing for Task C.3 ---
  let genre: string | undefined;
  let mediaImage: MediaRepresentation | undefined;
  let credits: CreditItem[] | undefined;
  let keywords: KeywordItem[] | undefined;
  let programAccessibilityAttributes: AccessibilityAttributes | undefined;

  if (basicDescription) {
    // Genre
    const genreEl = getChildElement(basicDescription, "Genre", tvaNamespace);
    if (genreEl) {
      genre = genreEl.getAttribute("href") || undefined;
      // TODO: Handle textual genre: getLocalizedTexts(genreEl, "Name", tvaNamespace)
    }

    // Keywords
    const keywordElements = getChildElements(
      basicDescription,
      "Keyword",
      tvaNamespace,
    );
    if (keywordElements.length > 0) {
      keywords = keywordElements
        .map((kwEl) => ({
          type: kwEl.getAttribute("type") || undefined,
          value: kwEl.textContent?.trim() || "",
        }))
        .filter((kw) => kw.value);
      if (keywords.length === 0) keywords = undefined;
    }

    // CreditsList
    const creditsListEl = getChildElement(
      basicDescription,
      "CreditsList",
      tvaNamespace,
    );
    if (creditsListEl) {
      const creditElements = getChildElements(
        creditsListEl,
        "CreditsItem",
        tvaNamespace,
      );
      if (creditElements.length > 0) {
        credits = creditElements
          .map((credEl) => {
            const creditItem: CreditItem = {};
            const roleEl = getChildElement(credEl, "Role", tvaNamespace);
            if (roleEl) {
              creditItem.role =
                roleEl.getAttribute("href") || roleEl.textContent?.trim();
            }

            // PersonName or OrganizationName (choice)
            const personNameEl = getChildElement(
              credEl,
              "PersonName",
              tvaNamespace,
            );
            if (personNameEl) {
              // PersonName itself can have GivenName, FamilyName, etc. or be simple text.
              // For simplicity, taking full text content.
              const nameText = personNameEl.textContent?.trim();
              if (nameText)
                creditItem.personName = {
                  lang: elementLanguage(personNameEl),
                  text: nameText,
                };
            } else {
              const orgNameEl = getChildElement(
                credEl,
                "OrganizationName",
                tvaNamespace,
              );
              if (orgNameEl) {
                const nameText = orgNameEl.textContent?.trim();
                if (nameText)
                  creditItem.personName = {
                    lang: elementLanguage(orgNameEl),
                    text: nameText,
                  }; // Using personName field for org too
              }
            }

            const characterEl = getChildElement(
              credEl,
              "Character",
              tvaNamespace,
            );
            if (characterEl && characterEl.textContent) {
              creditItem.characterName = {
                lang: elementLanguage(characterEl),
                text: characterEl.textContent.trim(),
              };
            }
            return creditItem;
          })
          .filter((cr) => Object.keys(cr).length > 0);
        if (credits.length === 0) credits = undefined;
      }
    }
  }

  // RelatedMaterial for Program Image
  const relatedMaterialElements = getChildElements(
    progElement,
    "RelatedMaterial",
    tvaNamespace,
  );
  relatedMaterialElements.forEach((rmEl) => {
    const howRelated = getChildValue(rmEl, "HowRelated", tvaNamespace, "href");
    if (howRelated === TVA_Program_Image_HowRelated_href) {
      const mediaLocatorEl = getChildElement(
        rmEl,
        "MediaLocator",
        tvaNamespace,
      );
      if (mediaLocatorEl) {
        mediaImage = getMedia(mediaLocatorEl) ?? undefined;
      }
    }
  });

  // Program-level AccessibilityAttributes
  const accessibilityElement = getChildElement(
    progElement,
    "AccessibilityAttributes",
    tvaNamespace,
  );
  if (accessibilityElement) {
    programAccessibilityAttributes =
      parseTVAAccessibilityAttributes(accessibilityElement);
  }

  // --- End: New field parsing ---

  return {
    id: programId,
    titles,
    startTime: startTimeEpoch,
    endTime: endTimeEpoch,
    description,
    parentalRatings: parentalRatings.length > 0 ? parentalRatings : undefined,
    cpsIndex: cpsIndex || undefined,
    // New fields added to return object
    genre,
    mediaImage,
    credits,
    keywords,
    accessibilityAttributes: programAccessibilityAttributes,
    // bilingual: undefined, // Needs specific mapping if available
    // channelImage: undefined, // Belongs to channel
    // channelStreamUrl: undefined, // Belongs to service instance
  };
};

interface ParsedProgramInfo {
  now?: ProgramRepresentation;
  next?: ProgramRepresentation;
}

export const parseProgramInfoXml = (xmlString: string): ParsedProgramInfo => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // Use undefined for namespaces to achieve wildcard matching
  const tvaNamespace = undefined;
  const cridNamespace = undefined;

  const programInfoElements = xmlDoc.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "ProgramInformation",
  );

  const programs: ProgramRepresentation[] = [];
  for (let i = 0; i < programInfoElements.length; i++) {
    const program = mapXmlToProgramRepresentation(
      programInfoElements[i],
      cridNamespace,
      tvaNamespace,
    );
    if (program) {
      programs.push(program);
    }
  }

  // Sort programs by start time to easily find now/next
  programs.sort((a, b) => a.startTime - b.startTime);

  const nowEpoch = Date.now();
  let currentProgram: ProgramRepresentation | undefined;
  let nextProgram: ProgramRepresentation | undefined;

  for (const prog of programs) {
    if (prog.startTime <= nowEpoch && prog.endTime > nowEpoch) {
      currentProgram = prog;
    } else if (prog.startTime > nowEpoch) {
      if (!nextProgram || prog.startTime < nextProgram.startTime) {
        nextProgram = prog;
      }
    }
  }

  // If no current program strictly matches, but there's one that just ended and a next one,
  // we might infer the one that just ended as "now" if the feed is slightly delayed.
  // Or, if the first program starts in the near future, it could be "now".
  // This logic can be refined based on typical feed characteristics.
  if (!currentProgram && programs.length > 0) {
    // Fallback: if the first program is very recent or about to start, consider it "now"
    if (programs[0].startTime <= nowEpoch + 5 * 60 * 1000) {
      // within next 5 mins or past
      // currentProgram = programs[0];
      // if (programs.length > 1 && programs[0].id !== programs[1].id) {
      //     nextProgram = programs[1];
      // }
    }
  }

  // If currentProgram is found, and nextProgram is still undefined,
  // try to find the program immediately following currentProgram in the sorted list.
  if (currentProgram && !nextProgram) {
    const currentIndex = programs.findIndex((p) => p.id === currentProgram.id);
    if (currentIndex !== -1 && currentIndex + 1 < programs.length) {
      nextProgram = programs[currentIndex + 1];
    }
  }

  return {
    now: currentProgram,
    next: nextProgram,
  };
};

export const parseScheduleXml = (
  xmlString: string,
): ProgramRepresentation[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // Use undefined for namespaces to achieve wildcard matching
  const tvaNamespace = undefined;
  const cridNamespace = undefined;

  const scheduleEvents = xmlDoc.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "ScheduleEvent",
  );
  const programs: ProgramRepresentation[] = [];

  // --- Start: CRID Resolution Logic (Task C.5) ---
  // 1. Build a map of all ProgramInformation elements by their programId
  const programInfoMap = new Map<string, Element>();
  const allProgramInfoElements = xmlDoc.getElementsByTagNameNS(
    tvaNamespace || WILDCARD_NS,
    "ProgramInformation",
  );
  for (let i = 0; i < allProgramInfoElements.length; i++) {
    const piElement = allProgramInfoElements[i];
    const programId = piElement.getAttribute("programId");
    if (programId) {
      programInfoMap.set(programId, piElement);
    }
  }
  // --- End: CRID Resolution Logic ---

  for (let i = 0; i < scheduleEvents.length; i++) {
    const eventElement = scheduleEvents[i];
    let programInfoSourceElement: Element | undefined | null = undefined;

    // Try to find an embedded ProgramInformation first
    programInfoSourceElement = eventElement.getElementsByTagNameNS(
      tvaNamespace || WILDCARD_NS,
      "ProgramInformation",
    )?.[0];

    if (!programInfoSourceElement) {
      // If not embedded, try to find a <Program crid="..."> reference
      const programCridRefElement = eventElement.getElementsByTagNameNS(
        tvaNamespace || WILDCARD_NS, // Assuming <Program> is in TVA namespace, adjust if CRID has its own
        "Program",
      )?.[0];

      if (programCridRefElement) {
        const crid = programCridRefElement.getAttribute("crid");
        if (crid) {
          // Look up the CRID in our map (programId in ProgramInformation is the CRID)
          programInfoSourceElement = programInfoMap.get(crid);
          if (!programInfoSourceElement) {
            // console.warn(`CRID ${crid} referenced in ScheduleEvent not found in ProgramInformationTable.`);
          }
        }
      }
    }

    // If still no source element, check if the ScheduleEvent itself has BasicDescription
    if (!programInfoSourceElement) {
      const basicDesc = eventElement.getElementsByTagNameNS(
        tvaNamespace || WILDCARD_NS,
        "BasicDescription",
      )?.[0];
      if (basicDesc) {
        // Treat the ScheduleEvent itself as the source for program details
        // This is for cases where ScheduleEvent directly contains program metadata
        // instead of referencing a ProgramInformation element.
        programInfoSourceElement = eventElement;
      } else {
        // console.warn("ScheduleEvent without embedded/referenced ProgramInformation or BasicDescription. Skipping.", eventElement);
        continue;
      }
    }

    // If we have a valid source (either embedded, resolved via CRID, or the event itself)
    const program = mapXmlToProgramRepresentation(
      programInfoSourceElement,
      cridNamespace,
      tvaNamespace,
    );
    if (program) {
      // Ensure start/end times are correctly derived from ScheduleEvent if not from ProgramInformation
      // mapXmlToProgramRepresentation already tries to get PublishedStartTime/Duration from ScheduleEvent context
      programs.push(program);
    }
  }
  return programs.sort((a, b) => a.startTime - b.startTime);
};
