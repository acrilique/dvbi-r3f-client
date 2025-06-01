import {
  ProgramRepresentation,
  LocalizedString,
  ParentalRating,
} from "../store/types";

// Helper to get a single child element's text content
const getChildElementText = (
  element: Element | null,
  tagName: string,
  namespace: string,
): string | undefined => {
  if (!element) return undefined;
  const child = element.getElementsByTagNameNS(namespace, tagName)?.[0];
  return child?.textContent?.trim();
};

// Helper to get multiple localized strings from elements like <Title lang="eng">...</Title>
const getLocalizedTexts = (
  parentElement: Element | null,
  tagName: string,
  namespace: string,
): LocalizedString[] => {
  if (!parentElement) return [];
  const results: LocalizedString[] = [];
  const elements = parentElement.getElementsByTagNameNS(namespace, tagName);
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const lang =
      el.getAttribute("xml:lang") || el.getAttribute("lang") || "und"; // Default to 'undetermined'
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
  tvaNamespace: string,
): ParentalRating[] => {
  const ratings: ParentalRating[] = [];
  const parentalGuidanceElements = programInfoElement.getElementsByTagNameNS(
    tvaNamespace,
    "ParentalGuidance",
  );
  for (let i = 0; i < parentalGuidanceElements.length; i++) {
    const guidanceElement = parentalGuidanceElements[i];
    const minimumAgeElement = guidanceElement.getElementsByTagNameNS(
      tvaNamespace,
      "MinimumAge",
    )?.[0];
    const ratingSystem = guidanceElement
      .getElementsByTagNameNS(tvaNamespace, "ParentalRating")?.[0]
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
  cridNamespace: string,
  tvaNamespace: string,
): ProgramRepresentation | null => {
  const programId =
    progElement.getAttribute("programId") ||
    getChildElementText(progElement, "InstanceMetadataId", cridNamespace) ||
    "";
  if (!programId) return null; // Essential identifier

  const titles = getLocalizedTexts(progElement, "Title", tvaNamespace);
  if (titles.length === 0) return null; // Essential information

  // Published start and end times (UTC)
  // For ProgramInformation, this might be in <PublishedStartTime> and <PublishedDuration>
  // For ScheduleEvent, this is <PublishedStartTime> and <PublishedEndTime> or <PublishedDuration>
  let startTimeEpoch: number | undefined;
  let endTimeEpoch: number | undefined;

  const basicDescription = progElement.getElementsByTagNameNS(
    tvaNamespace,
    "BasicDescription",
  )?.[0];
  if (!basicDescription) return null; // BasicDescription is crucial for many fields

  const synopsisElements = basicDescription.getElementsByTagNameNS(
    tvaNamespace,
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

  const programInfoTable = progElement.closest("ProgramLocationTable");
  const scheduleEvent = progElement.closest("ScheduleEvent");

  if (scheduleEvent) {
    // Typically from a <Schedule> context
    const startTimeStr = getChildElementText(
      scheduleEvent,
      "PublishedStartTime",
      tvaNamespace,
    );
    const durationStr = getChildElementText(
      scheduleEvent,
      "PublishedDuration",
      tvaNamespace,
    );
    const endTimeStr = getChildElementText(
      scheduleEvent,
      "PublishedEndTime",
      tvaNamespace,
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
      tvaNamespace,
    );
    const durationStr = getChildElementText(
      progElement,
      "PublishedDuration",
      tvaNamespace,
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

  const parentalRatings = parseParentalRatings(basicDescription, tvaNamespace);
  const cpsIndex = getChildElementText(
    progElement,
    "InstanceMetadataId",
    cridNamespace,
  ); // Re-check if this is the correct mapping for CPSIndex

  // bilingual, channelImage, channelStreamUrl are not typically part of ProgramInformation XML
  // and would be part of ChannelRepresentation or derived differently.

  return {
    id: programId,
    titles,
    startTime: startTimeEpoch,
    endTime: endTimeEpoch,
    description,
    parentalRatings: parentalRatings.length > 0 ? parentalRatings : undefined,
    cpsIndex: cpsIndex || undefined,
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

  // Define namespaces - these might need to be dynamically detected or confirmed
  const tvaNamespace =
    xmlDoc.documentElement.getAttribute("xmlns:tva") || "urn:tva:metadata:2019";
  const cridNamespace =
    xmlDoc.documentElement.getAttribute("xmlns:crid") || "urn:tva:mpeg7:2008"; // Example, verify actual CRID namespace

  const programInfoElements = xmlDoc.getElementsByTagNameNS(
    tvaNamespace,
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

  // Define namespaces - these might need to be dynamically detected or confirmed from the <Schedule> element
  const scheduleElement =
    xmlDoc.getElementsByTagName("Schedule")?.[0] || xmlDoc.documentElement;
  const tvaNamespace =
    scheduleElement.getAttribute("xmlns:tva") ||
    xmlDoc.documentElement.getAttribute("xmlns:tva") ||
    "urn:tva:metadata:2019";
  const cridNamespace =
    scheduleElement.getAttribute("xmlns:crid") ||
    xmlDoc.documentElement.getAttribute("xmlns:crid") ||
    "urn:tva:mpeg7:2008";

  const scheduleEvents = xmlDoc.getElementsByTagNameNS(
    tvaNamespace,
    "ScheduleEvent",
  );
  const programs: ProgramRepresentation[] = [];

  for (let i = 0; i < scheduleEvents.length; i++) {
    const eventElement = scheduleEvents[i];
    // A ScheduleEvent usually contains a Program element (CRID) or full ProgramInformation
    // For simplicity, we assume ProgramInformation is embedded or the eventElement itself has enough info
    // to be parsed by mapXmlToProgramRepresentation.
    // A more robust solution might need to handle Program CRIDs and look them up in a ProgramInformationTable if present.

    // Try to find an embedded ProgramInformation first
    let programInfoSourceElement = eventElement.getElementsByTagNameNS(
      tvaNamespace,
      "ProgramInformation",
    )?.[0];

    // If not found, the ScheduleEvent itself might contain the necessary <BasicDescription> etc.
    // or it might just have a <Program> CRID reference.
    // Our mapXmlToProgramRepresentation expects an element that *looks like* a ProgramInformation.
    if (!programInfoSourceElement) {
      // If there's a <Program> element (CRID ref), we can't resolve it without a ProgramInformationTable here.
      // So, we'll try to parse the ScheduleEvent itself if it directly contains BasicDescription.
      // This is a simplification; real EPGs might require CRID resolution.
      const basicDesc = eventElement.getElementsByTagNameNS(
        tvaNamespace,
        "BasicDescription",
      )?.[0];
      if (basicDesc) {
        programInfoSourceElement = eventElement;
      } else {
        // console.warn("ScheduleEvent without embedded ProgramInformation or BasicDescription, and CRID resolution not implemented.", eventElement);
        continue;
      }
    }

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
