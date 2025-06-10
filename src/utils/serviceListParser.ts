import {
  ChannelRepresentation,
  CmcdInitInfo,
  ContentGuideSourceInfo,
  DrmSystemRepresentation,
  LcnTableInfo,
  MediaPresentationApp,
  ParsedProviderRegistry,
  ParsedServiceList,
  ProviderInfo,
  ProminenceInfo,
  RegionInfo,
  ServiceInstanceRepresentation,
  ServiceListOffering,
  MediaRepresentation,
} from "../store/types";
import {
  getChildElements,
  getChildElement,
  getChildValue,
  getChildValues,
  getTexts,
  getMedia,
  parseTVAAccessibilityAttributes,
} from "./xmlParserUtils";

// Namespaces
const XML_MIME = "application/xml"; // Or "text/xml" depending on usage

// Constants from dvbi-common.js
const LCN_services_only = false;
const First_undeclared_channel = 7000;

// HowRelated URIs (from DVB-I-Reference-Client/identifiers.js)
const DVBi_HowRelated_href = "urn:dvb:metadata:cs:HowRelatedCS:2021";
const DVBi_Service_List_Logo = `${DVBi_HowRelated_href}:1001.1`; // "urn:dvb:metadata:cs:HowRelatedCS:2021:1001.1"
const DVBi_Service_Logo = `${DVBi_HowRelated_href}:1001.2`; // "urn:dvb:metadata:cs:HowRelatedCS:2021:1001.2"
const DVBi_Out_Of_Service_Logo = `${DVBi_HowRelated_href}:1000.1`; // "urn:dvb:metadata:cs:HowRelatedCS:2021:1000.1"

const DVBi_LinkedApplication_CS =
  "urn:dvb:metadata:cs:LinkedApplicationCS:2019";
const DVBi_App_In_Parallel = `${DVBi_LinkedApplication_CS}:1.1`; // "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.1"
const DVBi_App_Controlling_Media = `${DVBi_LinkedApplication_CS}:1.2`; // "urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.2"

function parseContentGuideSource(
  src: Element | null,
): ContentGuideSourceInfo | null {
  if (!src) return null;
  const cgsid = src.getAttribute("CGSID");
  if (!cgsid) return null;

  const scheduleInfoEndpointEl = getChildElement(
    src,
    "ScheduleInfoEndpoint",
    undefined, // Wildcard namespace
  );
  const contentGuideURI = scheduleInfoEndpointEl
    ? getChildValue(scheduleInfoEndpointEl, "URI", undefined) // Wildcard namespace
    : null;

  const moreEpisodesEndpointEl = getChildElement(
    src,
    "MoreEpisodesEndpoint",
    undefined, // Wildcard namespace
  );
  const moreEpisodesURI = moreEpisodesEndpointEl
    ? getChildValue(moreEpisodesEndpointEl, "URI", undefined) // Wildcard namespace
    : null;

  const programInfoEndpointEl = getChildElement(
    src,
    "ProgramInfoEndpoint",
    undefined, // Wildcard namespace
  );
  const programInfoURI = programInfoEndpointEl
    ? getChildValue(programInfoEndpointEl, "URI", undefined) // Wildcard namespace
    : null;

  return {
    id: cgsid,
    contentGuideURI,
    moreEpisodesURI,
    programInfoURI,
  };
}

// Note: parseCMCDInitInfo was not part of the initial list of items to move,
// but it's a specific parser tied to ServiceList structure rather than a generic XML util.
// It will remain here for now, unless a broader refactor of specific parsers is undertaken.
function parseCMCDInitInfo(element: Element | null): CmcdInitInfo | null {
  if (!element) return null;
  if (
    !element.hasAttribute("reportingMode") ||
    !element.hasAttribute("reportingMethod") ||
    !element.hasAttribute("version")
  ) {
    return null;
  }

  const cmcdInfo: Partial<CmcdInitInfo> = { enabled: true };

  switch (element.getAttribute("reportingMode")) {
    case "urn:dvb:metadata:cmcd:delivery:request":
      // currently not used in dash.js, but we parse it
      break;
    default:
      cmcdInfo.enabled = false;
      break;
  }

  switch (element.getAttribute("reportingMethod")) {
    case "urn:dvb:metadata:cmcd:delivery:customHTTPHeader":
      cmcdInfo.mode = "header";
      break;
    case "urn:dvb:metadata:cmcd:delivery:queryArguments":
      cmcdInfo.mode = "query";
      break;
    default:
      cmcdInfo.enabled = false;
      break;
  }

  if (element.hasAttribute("enabledKeys")) {
    cmcdInfo.enabledKeys = element.getAttribute("enabledKeys")!.split(" ");
  }
  if (element.hasAttribute("contentId")) {
    cmcdInfo.cid = element.getAttribute("contentId")!;
  }
  cmcdInfo.version = parseInt(element.getAttribute("version")!, 10);

  return cmcdInfo.enabled ? (cmcdInfo as CmcdInitInfo) : null;
}

// --- Main Service List Parser ---
export function parseServiceListXml(
  xmlString: string,
  supportedDrmSystems?: string[],
): ParsedServiceList {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, XML_MIME);

  // Check for parser errors
  const parserErrorElement = doc.getElementsByTagName("parsererror");
  if (parserErrorElement.length > 0) {
    console.error("[ServiceListParser] XML Parsing Error detected.");
    let errorDetails = "No details available";
    // Try to get more specific error message from the parsererror element
    if (parserErrorElement[0].textContent) {
      errorDetails = parserErrorElement[0].textContent.trim();
    } else if (
      parserErrorElement[0].childNodes.length > 0 &&
      parserErrorElement[0].childNodes[0].nodeValue
    ) {
      errorDetails = parserErrorElement[0].childNodes[0].nodeValue.trim();
    }
    return { services: [], regions: [], lcnTables: [], image: undefined }; // Return empty result
  }

  let serviceListElement: Element | null = doc.documentElement as Element;
  console.log(
    "[ServiceListParser] Initial Document Element - LocalName:",
    serviceListElement.localName,
    "NamespaceURI:",
    serviceListElement.namespaceURI,
  );

  // If documentElement is not ServiceList, try to find it as a child.
  if (serviceListElement.localName !== "ServiceList") {
    console.warn(
      `[ServiceListParser] Document element is not <ServiceList>. Attempting to find it as a child...`,
    );
    const foundServiceList = getChildElement(
      doc.documentElement as Element,
      "ServiceList",
      undefined,
    ); // Try with any namespace
    if (foundServiceList) {
      console.log(
        `[ServiceListParser] Found <ServiceList> as a child with namespace "${foundServiceList.namespaceURI}". Proceeding with this element.`,
      );
      serviceListElement = foundServiceList;
    } else {
      console.error(
        "[ServiceListParser] <ServiceList> element not found as document root or as a direct child. Cannot reliably parse services.",
      );
      return { services: [], regions: [], lcnTables: [], image: undefined }; // Return empty result
    }
  }

  if (!serviceListElement) {
    // Should not happen if logic above is correct, but as a safeguard
    console.error(
      "[ServiceListParser] ServiceList element is null after attempts to find it. Cannot parse.",
    );
    return { services: [], regions: [], lcnTables: [], image: undefined };
  }

  // Reference client uses wildcard ("*") for DVBi_ns, so we pass undefined to our helpers
  // to achieve the same local-name-only matching for DVB-I specific children of ServiceList.
  const dvbiWildcardNs = undefined;
  console.log(
    "[ServiceListParser] ServiceList Element - LocalName:",
    serviceListElement.localName,
    "NamespaceURI (actual):",
    serviceListElement.namespaceURI,
    "(Parsing DVB-I children with wildcard namespace)",
  );

  const result: ParsedServiceList = {
    services: [],
    regions: [],
    lcnTables: [],
  };

  const topRelatedMaterial = getChildElements(
    serviceListElement,
    "RelatedMaterial",
    dvbiWildcardNs, // DVB-I elements directly under ServiceList
  );
  topRelatedMaterial.forEach((rm) => {
    // Children of RelatedMaterial (like HowRelated, MediaLocator) are often TVA,
    // so use undefined for namespace to match by local name, consistent with reference.
    const howRelated = getChildValue(rm, "HowRelated", undefined, "href");
    if (howRelated === DVBi_Service_List_Logo) {
      const mediaLocator = getChildElement(rm, "MediaLocator", undefined);
      result.image = getMedia(mediaLocator) || undefined;
    }
  });

  const regionListElement = getChildElement(
    serviceListElement,
    "RegionList",
    dvbiWildcardNs,
  );
  if (regionListElement) {
    const regionElements = getChildElements(
      regionListElement,
      "Region",
      dvbiWildcardNs,
    );
    result.regions = regionElements.map((re) => {
      const region: RegionInfo = {
        regionID: re.getAttribute("regionID") || "",
        selectable: re.getAttribute("selectable") !== "false",
        countryCodes: re.getAttribute("countryCodes") || undefined,
      };
      const names = getTexts(
        getChildElements(re, "RegionName", dvbiWildcardNs),
      );
      if (names.length === 1) region.regionName = names[0].text;
      else if (names.length > 1) region.regionNames = names;

      // Parse detailed geographical information
      const wildcardPostcodes = getChildValues(
        re,
        "WildcardPostcode",
        dvbiWildcardNs,
      );
      if (wildcardPostcodes.length > 0)
        region.wildcardPostcodes = wildcardPostcodes;

      const postcodes = getChildValues(re, "Postcode", dvbiWildcardNs);
      if (postcodes.length > 0) region.postcodes = postcodes;

      const postcodeRangeElements = getChildElements(
        re,
        "PostcodeRange",
        dvbiWildcardNs,
      );
      if (postcodeRangeElements.length > 0) {
        region.postcodeRanges = postcodeRangeElements
          .map((pcrEl) => {
            const from = pcrEl.getAttribute("from");
            const to = pcrEl.getAttribute("to");
            if (from && to) {
              return { from, to };
            }
            return null;
          })
          .filter((pcr) => pcr !== null);
        if (region.postcodeRanges?.length === 0) delete region.postcodeRanges;
      }

      const coordinatesElements = getChildElements(
        re,
        "Coordinates",
        dvbiWildcardNs,
      );
      if (coordinatesElements.length > 0) {
        region.coordinates = coordinatesElements
          .map((coordsEl) => {
            const latitude = getChildValue(
              coordsEl,
              "Latitude",
              dvbiWildcardNs,
            );
            const longitude = getChildValue(
              coordsEl,
              "Longitude",
              dvbiWildcardNs,
            );
            const radius = getChildValue(coordsEl, "Radius", dvbiWildcardNs);
            if (latitude && longitude && radius) {
              return { latitude, longitude, radius };
            }
            return null;
          })
          .filter((coords) => coords !== null);
        if (region.coordinates?.length === 0) delete region.coordinates;
      }

      return region;
    });
  }

  const lcnTableElements = getChildElements(
    serviceListElement,
    "LCNTable",
    dvbiWildcardNs,
  );
  result.lcnTables = lcnTableElements.map((lte) => {
    const lcnTable: LcnTableInfo = {
      lcn: [],
      defaultRegion:
        lte.getAttribute("defaultRegion") === "true" ||
        !getChildElements(lte, "TargetRegion", dvbiWildcardNs).length,
      targetRegions: getChildValues(lte, "TargetRegion", dvbiWildcardNs),
    };
    const lcnElements = getChildElements(lte, "LCN", dvbiWildcardNs);
    lcnTable.lcn = lcnElements.map((lcne) => ({
      serviceRef: lcne.getAttribute("serviceRef") || "",
      channelNumber: parseInt(lcne.getAttribute("channelNumber") || "0", 10),
    }));
    return lcnTable;
  });

  let defaultContentGuide: ContentGuideSourceInfo | null = null;
  const topCgsElement = getChildElement(
    serviceListElement,
    "ContentGuideSource",
    dvbiWildcardNs,
  );
  if (topCgsElement) {
    defaultContentGuide = parseContentGuideSource(topCgsElement);
  }

  const cgsListElement = getChildElement(
    serviceListElement,
    "ContentGuideSourceList",
    dvbiWildcardNs,
  );
  const contentGuideSourcesList: Record<string, ContentGuideSourceInfo> = {};
  if (cgsListElement) {
    getChildElements(
      cgsListElement,
      "ContentGuideSource",
      dvbiWildcardNs,
    ).forEach((cgsEl) => {
      const cgs = parseContentGuideSource(cgsEl);
      if (cgs && cgs.id) {
        contentGuideSourcesList[cgs.id] = cgs;
      }
    });
  }

  const serviceElements = getChildElements(
    serviceListElement,
    "Service",
    dvbiWildcardNs,
  );
  console.log(
    "[ServiceListParser] Found serviceElements count (targetting Service with wildcard namespace):",
    serviceElements.length,
  );
  let maxLcn = 0;

  serviceElements.forEach((serviceEl, index) => {
    const uniqueIdentifier = getChildValue(
      serviceEl,
      "UniqueIdentifier",
      dvbiWildcardNs,
    );
    if (!uniqueIdentifier) {
      console.warn(
        `[ServiceListParser] Service element at index ${index} is missing UniqueIdentifier. Skipping.`,
      );
      return;
    }

    const chan: Partial<ChannelRepresentation> = { id: uniqueIdentifier };
    chan.titles = getTexts(
      getChildElements(serviceEl, "ServiceName", dvbiWildcardNs),
    );
    const providerNames = getTexts(
      getChildElements(serviceEl, "ProviderName", dvbiWildcardNs),
    );
    if (providerNames.length > 0) {
      chan.provider = providerNames[0].text;
      if (providerNames.length > 1) chan.providers = providerNames;
    }

    const cgsRefId = getChildValue(
      serviceEl,
      "ContentGuideSourceRef",
      dvbiWildcardNs,
    );
    if (cgsRefId && contentGuideSourcesList[cgsRefId]) {
      const cgs = contentGuideSourcesList[cgsRefId];
      chan.contentGuideURI = cgs.contentGuideURI || undefined;
      chan.moreEpisodesURI = cgs.moreEpisodesURI || undefined;
      chan.programInfoURI = cgs.programInfoURI || undefined;
    } else {
      const directCgsEl = getChildElement(
        serviceEl,
        "ContentGuideSource",
        dvbiWildcardNs,
      );
      const directCgs = parseContentGuideSource(directCgsEl);
      if (directCgs) {
        chan.contentGuideURI = directCgs.contentGuideURI || undefined;
        chan.moreEpisodesURI = directCgs.moreEpisodesURI || undefined;
        chan.programInfoURI = directCgs.programInfoURI || undefined;
      } else if (defaultContentGuide) {
        chan.contentGuideURI = defaultContentGuide.contentGuideURI || undefined;
        chan.moreEpisodesURI = defaultContentGuide.moreEpisodesURI || undefined;
        chan.programInfoURI = defaultContentGuide.programInfoURI || undefined;
      }
    }

    chan.parallelApps = [];
    chan.mediaPresentationApps = [];
    // RelatedMaterial under Service is DVB-I specific, but its children (HowRelated, MediaLocator) are TVA.
    // So, getChildElements for RelatedMaterial uses dvbiWildcardNs.
    // Then, getChildValue/Element for HowRelated/MediaLocator use undefined for namespace.
    getChildElements(serviceEl, "RelatedMaterial", dvbiWildcardNs).forEach(
      (rmEl) => {
        const howRelated = getChildValue(rmEl, "HowRelated", undefined, "href"); // TVA child
        const mediaLocatorEl = getChildElement(rmEl, "MediaLocator", undefined); // TVA child
        if (howRelated === DVBi_Service_Logo) {
          chan.image = getMedia(mediaLocatorEl) || undefined;
        } else if (howRelated === DVBi_Out_Of_Service_Logo) {
          chan.out_of_service_image = getMedia(mediaLocatorEl) || undefined;
        } else if (
          howRelated === DVBi_App_In_Parallel ||
          howRelated === DVBi_App_Controlling_Media
        ) {
          const mediaUriEl = mediaLocatorEl
            ? getChildElement(mediaLocatorEl, "MediaUri", undefined)
            : null;
          if (mediaUriEl && mediaUriEl.textContent) {
            const app: MediaPresentationApp = {
              url: mediaUriEl.textContent.trim(),
              contentType: mediaUriEl.getAttribute("contentType") || "",
            };
            if (howRelated === DVBi_App_In_Parallel)
              chan.parallelApps?.push(app);
            else chan.mediaPresentationApps?.push(app);
          }
        }
      },
    );

    const prominenceListEl = getChildElement(
      serviceEl,
      "ProminenceList",
      dvbiWildcardNs,
    );
    if (prominenceListEl) {
      chan.prominences = getChildElements(
        prominenceListEl,
        "Prominence",
        dvbiWildcardNs,
      )
        .map((pEl) => ({
          country: pEl.getAttribute("country") || undefined,
          region: pEl.getAttribute("region") || undefined,
          ranking: parseInt(pEl.getAttribute("ranking") || "", 10) || undefined,
        }))
        .filter((p) => p.ranking !== undefined) as ProminenceInfo[];
    }

    chan.serviceInstances = [];
    getChildElements(serviceEl, "ServiceInstance", dvbiWildcardNs).forEach(
      (siEl) => {
        const instance: Partial<ServiceInstanceRepresentation> = {};
        instance.priority = parseInt(siEl.getAttribute("priority") || "1", 10);
        instance.titles = getTexts(
          getChildElements(siEl, "DisplayName", dvbiWildcardNs),
        );

        instance.contentProtection = [];
        getChildElements(siEl, "ContentProtection", dvbiWildcardNs).forEach(
          (cpEl) => {
            // DRMSystemId is a DVB-I types element, so use dvbiWildcardNs (which is undefined)
            getChildElements(cpEl, "DRMSystemId", dvbiWildcardNs).forEach(
              (drmEl) => {
                const drm: DrmSystemRepresentation = {
                  drmSystemId: drmEl.textContent?.trim(),
                  encryptionScheme:
                    drmEl.getAttribute("encryptionScheme") || undefined,
                  cpsIndex: drmEl.getAttribute("cpsIndex") || undefined,
                };
                instance.contentProtection?.push(drm);
              },
            );
          },
        );

        if (supportedDrmSystems && instance.contentProtection.length > 0) {
          const isSupported = instance.contentProtection.some(
            (cp) =>
              cp.drmSystemId &&
              supportedDrmSystems.includes(cp.drmSystemId.toLowerCase()),
          );
          if (!isSupported) return;
        }

        const dashDeliveryEl = getChildElement(
          siEl,
          "DASHDeliveryParameters",
          dvbiWildcardNs,
        );
        if (dashDeliveryEl) {
          const uriBasedLocationEl = getChildElement(
            // This is a DVB-I types element
            dashDeliveryEl,
            "UriBasedLocation",
            dvbiWildcardNs, // Use dvbiWildcardNs for DVB-I types under DASHDeliveryParameters
          );
          if (uriBasedLocationEl) {
            // URI under UriBasedLocation is also DVB-I types
            instance.dashUrl =
              getChildValue(uriBasedLocationEl, "URI", dvbiWildcardNs) ||
              undefined;
          }
          const cmcdEl = getChildElement(
            // CMCD is a DVB-I element
            dashDeliveryEl,
            "CMCD",
            dvbiWildcardNs,
          );
          instance.CMCDinit = parseCMCDInitInfo(cmcdEl);
        }

        const contentAttributesEl = getChildElement(
          // ContentAttributes is a DVB-I element
          siEl,
          "ContentAttributes",
          dvbiWildcardNs,
        );
        if (contentAttributesEl) {
          // AccessibilityAttributes under ContentAttributes is a TVA element
          const accessibilityEl = getChildElement(
            contentAttributesEl,
            "AccessibilityAttributes",
            undefined,
          );
          if (!chan.accessibility_attributes && accessibilityEl) {
            chan.accessibility_attributes =
              parseTVAAccessibilityAttributes(accessibilityEl);
          }
        }
        chan.serviceInstances?.push(instance as ServiceInstanceRepresentation);
      },
    );

    let lcnAssigned = false;
    if (result.lcnTables && result.lcnTables.length > 0) {
      const lcnTableToUse =
        result.lcnTables.find((lt) => lt.defaultRegion) || result.lcnTables[0];
      const lcnEntry = lcnTableToUse.lcn.find((l) => l.serviceRef === chan.id);
      if (lcnEntry) {
        chan.lcn = lcnEntry.channelNumber;
        if (chan.lcn > maxLcn) maxLcn = chan.lcn;
        lcnAssigned = true;
      }
    }

    if (!lcnAssigned && !LCN_services_only) {
      chan.lcn = First_undeclared_channel + result.services.length;
    } else if (!lcnAssigned && LCN_services_only) {
      return;
    }

    if (chan.lcn === undefined) {
      if (LCN_services_only) return;
      chan.lcn = First_undeclared_channel + result.services.length;
    }

    result.services.push(chan as ChannelRepresentation);
  });

  result.services.forEach((s) => {
    if (s.lcn && s.lcn > maxLcn && s.lcn < First_undeclared_channel)
      maxLcn = s.lcn;
  });
  result.services.forEach((s) => {
    if (s.lcn === undefined || s.lcn < 0) {
      s.lcn = ++maxLcn;
    }
  });

  return result;
}

function parseProviderInfo(
  providerInfoElements: Element[],
  ns: string | undefined,
): Partial<ProviderInfo> {
  const info: Partial<ProviderInfo> = {
    name: undefined,
    icons: [],
    servicelists: [],
  };
  if (providerInfoElements.length > 0) {
    const providerInfoEl = providerInfoElements[0];
    info.name =
      getChildValue(providerInfoEl, "Name", ns)?.trim() || "Unnamed Provider";

    const iconElements = getChildElements(providerInfoEl, "Icon", "*"); // Wildcard for namespace
    info.icons = iconElements
      .map((iconEl) => getMedia(iconEl))
      .filter((media) => media !== null);
  }
  return info;
}

// --- Service List Provider Parser ---
export function parseServiceListProvidersXml(
  xmlString: string,
): ParsedProviderRegistry {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, XML_MIME);
  const result: ParsedProviderRegistry = {
    registryInfo: {},
    providerList: [],
  };

  // Use wildcard for namespaces to match reference implementation's flexibility
  const ns = undefined;
  const servicediscoveryNS = undefined;

  const registryEntity = getChildElements(
    doc.documentElement,
    "ServiceListRegistryEntity",
    ns,
  );
  result.registryInfo = parseProviderInfo(registryEntity, ns);

  const providerOfferings = getChildElements(
    doc.documentElement,
    "ProviderOffering",
    ns,
  );

  result.providerList = providerOfferings.map((providerOfferingEl) => {
    const providerInfoElements = getChildElements(
      providerOfferingEl,
      "Provider",
      ns,
    );
    const info = parseProviderInfo(providerInfoElements, ns);

    const serviceListOfferingElements = getChildElements(
      providerOfferingEl,
      "ServiceListOffering",
      ns,
    );

    const servicelists: ServiceListOffering[] = serviceListOfferingElements.map(
      (listEl) => {
        const list: Partial<ServiceListOffering> = {};
        list.name =
          getChildValue(listEl, "ServiceListName", ns)?.trim() ||
          "Unnamed List";

        const serviceListURIEl = getChildElement(listEl, "ServiceListURI", ns);
        if (serviceListURIEl) {
          list.url =
            getChildValue(
              serviceListURIEl,
              "URI",
              servicediscoveryNS,
            )?.trim() || "";
        } else {
          list.url = "";
        }

        const listIcons: MediaRepresentation[] = [];
        const relatedMaterial = getChildElements(listEl, "RelatedMaterial", ns);
        relatedMaterial.forEach((rmEl) => {
          const howRelated = getChildValue(rmEl, "HowRelated", "*", "href");
          if (howRelated === "urn:dvb:metadata:cs:HowRelatedCS:2020:1001.1") {
            const mediaLocators = getChildElements(rmEl, "MediaLocator", "*");
            mediaLocators.forEach((mlEl) => {
              const media = getMedia(mlEl);
              if (media) {
                listIcons.push(media);
              }
            });
          }
        });
        list.icons = listIcons;

        const srsSupport = getChildElement(listEl, "SRSSupport", ns);
        if (srsSupport) {
          list.postcodeFiltering =
            srsSupport.getAttribute("postcode") === "true";
          list.regionIdFiltering =
            srsSupport.getAttribute("regionID") === "true";
          list.multiplexFiltering =
            srsSupport.getAttribute("receivedMultiplex") === "true";
        }

        return list as ServiceListOffering;
      },
    );

    return {
      name: info.name || "Unknown Provider",
      icons: info.icons || [],
      servicelists: servicelists,
    };
  });

  return result;
}

// --- Region and Postcode Helper Functions (from dvbi-common.js) ---

// Note: The core logic of parseRegion from dvbi-common.js for parsing a single <Region> element
// is already integrated into the .map() callback for regionElements in parseServiceListXml.
// The recursive parsing of nested <Region> elements from dvbi-common.js is not directly
// replicated here as DVB-I A177r5 section 6.3.2.2 states <RegionList> contains <Region> elements,
// and <Region> itself does not contain further <Region> elements according to the DVB-I schema.
// The current implementation iterates over all <Region> elements found under <RegionList>.

export function matchPostcodeWildcard(
  wildcard: string,
  postCode: string,
): boolean {
  const wildcardIndex = wildcard.indexOf("*");
  if (wildcardIndex === -1) {
    return wildcard === postCode; // No wildcard, direct match
  }
  if (wildcardIndex === wildcard.length - 1) {
    // Wildcard is in the end
    const wildcardMatch = wildcard.substring(0, wildcard.length - 1);
    return postCode.startsWith(wildcardMatch);
  } else if (wildcardIndex === 0) {
    const wildcardMatch = wildcard.substring(1);
    return postCode.endsWith(wildcardMatch);
  } else {
    const startMatch = wildcard.substring(0, wildcardIndex);
    const endMatch = wildcard.substring(wildcardIndex + 1);
    return postCode.startsWith(startMatch) && postCode.endsWith(endMatch);
  }
}

export function matchPostcodeRange(
  range: { from: string; to: string },
  postCode: string,
): boolean {
  // Assuming numeric comparison for postcodes if they are purely numeric,
  // otherwise string comparison. For simplicity, using string comparison.
  return range.from <= postCode && range.to >= postCode;
}

export function findRegionFromPostCode(
  regions: RegionInfo[] | undefined,
  postCode: string,
): RegionInfo | null {
  if (!regions) return null;
  for (const region of regions) {
    if (region.postcodes) {
      if (region.postcodes.includes(postCode)) {
        return region;
      }
    }
    if (region.postcodeRanges) {
      for (const range of region.postcodeRanges) {
        if (matchPostcodeRange(range, postCode)) {
          return region;
        }
      }
    }
    if (region.wildcardPostcodes) {
      for (const wildcard of region.wildcardPostcodes) {
        if (matchPostcodeWildcard(wildcard, postCode)) {
          return region;
        }
      }
    }
  }
  return null;
}

// --- Service Availability Helper Functions (from dvbi-common.js) ---

export function parseIntervalTime(time: string): Date | null {
  // Expects time in "HH:MM:SSZ" format (UTC)
  if (time.length === 9 && time.charAt(8).toUpperCase() === "Z") {
    const parts = time.substring(0, 8).split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);

      if (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        !isNaN(seconds) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59 &&
        seconds >= 0 &&
        seconds <= 59
      ) {
        const date = new Date(); // Use current date, but set time to UTC
        date.setUTCHours(hours, minutes, seconds, 0);
        return date;
      }
    }
  }
  console.warn(`[ServiceListParser] Invalid interval time format: ${time}`);
  return null;
}

export function isIntervalNow(
  interval: {
    days?: string;
    startTime?: string;
    endTime?: string;
  },
  now: Date,
): boolean {
  if (interval.days) {
    let currentDay = now.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
    if (currentDay === 0) currentDay = 7; // Adjust Sunday to 7 to match DVB-I spec (1-7 Mon-Sun)
    if (!interval.days.includes(currentDay.toString())) {
      return false;
    }
  }

  const nowTime = new Date(now); // Clone to avoid modifying original `now`
  // We only care about the time part for comparison, so set date parts to a common epoch
  // This is tricky because parseIntervalTime creates a date with *today's* date but UTC time.
  // For a robust comparison, we should compare only the time components or ensure both dates are on the same day.

  // Let's get the current UTC time components
  const currentUTCHours = now.getUTCHours();
  const currentUTCMinutes = now.getUTCMinutes();
  const currentUTCSeconds = now.getUTCSeconds();
  const nowTimeInSeconds =
    currentUTCHours * 3600 + currentUTCMinutes * 60 + currentUTCSeconds;

  if (interval.startTime) {
    const startTimeDate = parseIntervalTime(interval.startTime);
    if (startTimeDate) {
      const startUTCHours = startTimeDate.getUTCHours();
      const startUTCMinutes = startTimeDate.getUTCMinutes();
      const startUTCSeconds = startTimeDate.getUTCSeconds();
      const startTimeInSeconds =
        startUTCHours * 3600 + startUTCMinutes * 60 + startUTCSeconds;
      if (startTimeInSeconds > nowTimeInSeconds) {
        return false;
      }
    } else {
      return false; // Invalid start time format
    }
  }

  if (interval.endTime) {
    const endTimeDate = parseIntervalTime(interval.endTime);
    if (endTimeDate) {
      const endUTCHours = endTimeDate.getUTCHours();
      const endUTCMinutes = endTimeDate.getUTCMinutes();
      const endUTCSeconds = endTimeDate.getUTCSeconds();
      const endTimeInSeconds =
        endUTCHours * 3600 + endUTCMinutes * 60 + endUTCSeconds;

      let definedStartTimeInSeconds = -1;
      if (interval.startTime) {
        const sTimeDate = parseIntervalTime(interval.startTime);
        if (sTimeDate) {
          definedStartTimeInSeconds =
            sTimeDate.getUTCHours() * 3600 +
            sTimeDate.getUTCMinutes() * 60 +
            sTimeDate.getUTCSeconds();
        }
      }

      // If endTime is 00:00:00Z, it means end of day, so effectively 24:00:00
      // or check if it's less than or equal to nowTimeInSeconds
      if (endTimeInSeconds === 0 && definedStartTimeInSeconds > 0) {
        // Spans midnight
        // This case is complex if interval spans midnight and endTime is 00:00:00 of next day.
        // For simplicity, assuming endTime is within the same UTC day or means "up to this time".
        // If endTime is 00:00:00Z, it means the interval ends at the very start of that UTC time.
        // So, if nowTimeInSeconds is 0, it's still within. If >0, it's past.
        if (nowTimeInSeconds >= endTimeInSeconds && endTimeInSeconds !== 0)
          return false; // Standard case
        // if endTimeInSeconds is 0, it means up to the end of the day.
        // This logic might need refinement for intervals precisely ending at midnight.
      } else if (endTimeInSeconds <= nowTimeInSeconds) {
        // If start time was also defined, and start time is greater than end time, it implies crossing midnight.
        if (
          !(
            definedStartTimeInSeconds !== -1 &&
            definedStartTimeInSeconds > endTimeInSeconds &&
            nowTimeInSeconds < endTimeInSeconds
          )
        ) {
          // not crossing midnight or already handled
          return false;
        }
      }
    } else {
      return false; // Invalid end time format
    }
  }
  return true;
}

export function isServiceInstanceAvailable(
  instance: ServiceInstanceRepresentation,
): boolean {
  if (instance.availability && instance.availability.length > 0) {
    const now = new Date();
    // Per DVB-I A177r5 section 7.6.3, if <Availability> is present, at least one <Period> must be active.
    // And within an active <Period>, if <Interval> elements are present, at least one must be active.
    // If no <Interval> elements are present in an active <Period>, the service is available throughout that period.

    for (const period of instance.availability) {
      let periodActive = true;
      if (period.validFrom) {
        if (new Date(period.validFrom) > now) {
          periodActive = false;
        }
      }
      if (period.validTo) {
        if (new Date(period.validTo) < now) {
          periodActive = false;
        }
      }

      if (periodActive) {
        // Period is active, now check intervals
        if (period.intervals && period.intervals.length > 0) {
          let intervalActive = false;
          for (const interval of period.intervals) {
            if (isIntervalNow(interval, now)) {
              intervalActive = true;
              break; // Found an active interval
            }
          }
          if (intervalActive) return true; // Active period and active interval
        } else {
          return true; // Active period and no intervals means available throughout the period
        }
      }
    }
    return false; // No active period (or no active interval within an active period)
  }
  return true; // No <Availability> element means always available
}

// TODO:
// - selectServiceListRegion (this is more of a store action/logic than pure parsing)
