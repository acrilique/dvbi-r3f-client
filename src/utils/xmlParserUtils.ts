import {
  AccessibilityAttributes,
  AccessibilityAudioAttributes,
  AccessibilityAudioDescription,
  AccessibilityAppAndPurpose,
  AccessibilitySigning,
  AccessibilitySubtitleAttributes,
  LocalizedString,
  MediaRepresentation,
} from "../store/types";

// --- CS Maps (from CSmap.js) ---
export const OPEN_SUBITLES_STRING = "open"; // Used in TVASubtitleCarriageCSmap

export interface CSMapEntry {
  value: string;
  definition: string;
}

export function datatypeIs(variable: unknown): string {
  if (Array.isArray(variable)) return "array";
  return typeof variable;
}

export function mapValues(
  vals: string | string[] | null | undefined,
  map: CSMapEntry[],
): string | string[] | null {
  function mapValue(val: string): string {
    const found = map.find((e) => e.value === val);
    // TODO: Integrate i18n for definitions starting with "~"
    return found
      ? found.definition.startsWith("~")
        ? found.definition.substring(1)
        : found.definition
      : "!err!";
  }
  const typ = datatypeIs(vals);
  if (typ === "array") {
    if ((vals as string[]).length === 0) return null;
    return (vals as string[]).map(mapValue);
  } else if (typ === "string") {
    return vals === "" ? null : mapValue(vals as string);
  }
  return null;
}

export const TVASubtitleCarriageCSuri =
  "urn:tva:metadata:cs:SubtitleCarriageCS:2023";
export const TVASubtitleCarriageCSmap: CSMapEntry[] = [
  { value: `${TVASubtitleCarriageCSuri}:1`, definition: "app" },
  { value: `${TVASubtitleCarriageCSuri}:2.1`, definition: "ttml" },
  { value: `${TVASubtitleCarriageCSuri}:3`, definition: "isobmff" },
  { value: `${TVASubtitleCarriageCSuri}:4`, definition: "standalone" },
  { value: `${TVASubtitleCarriageCSuri}:5`, definition: OPEN_SUBITLES_STRING },
  { value: `${TVASubtitleCarriageCSuri}:99`, definition: "other" },
];
export function SubtitleCarriageCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, TVASubtitleCarriageCSmap);
}

export const TVASubtitleCodingCSuri =
  "urn:tva:metadata:cs:SubtitleCodingFormatCS:2023";
export const TVASubtitleCodingCSmap: CSMapEntry[] = [
  { value: `${TVASubtitleCodingCSuri}:1`, definition: "WST" },
  { value: `${TVASubtitleCodingCSuri}:2.1.2`, definition: "DVB bmp 1.2.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.3`, definition: "DVB bmp 1.3.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.4`, definition: "DVB bmp 1.5.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.5`, definition: "DVB bmp 1.6.1" },
  { value: `${TVASubtitleCodingCSuri}:2.2`, definition: "DVB char" },
  { value: `${TVASubtitleCodingCSuri}:3.1`, definition: "EBU-TT" },
  { value: `${TVASubtitleCodingCSuri}:3.2.1`, definition: "EBU-TT-D 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.2.2`, definition: "EBU-TT-D 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.3`, definition: "SMPTE-TT" },
  { value: `${TVASubtitleCodingCSuri}:3.4.1`, definition: "CFF-TT-t" },
  { value: `${TVASubtitleCodingCSuri}:3.4.2`, definition: "CFF-TT-i" },
  { value: `${TVASubtitleCodingCSuri}:3.5`, definition: "SDP-US" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.1`, definition: "IMSC-t 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.2`, definition: "IMSC-t 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.3`, definition: "IMSC-t 1.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.4`, definition: "IMSC-t 1.2" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.1`, definition: "IMSC-i 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.2`, definition: "IMSC-i 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.3`, definition: "IMSC-i 1.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.4`, definition: "IMSC-i 1.2" },
  { value: `${TVASubtitleCodingCSuri}:3.7`, definition: "ARIB-TT" },
  { value: `${TVASubtitleCodingCSuri}:4`, definition: "WebVTT" },
  { value: `${TVASubtitleCodingCSuri}:5`, definition: "SRT" },
  { value: `${TVASubtitleCodingCSuri}:8`, definition: "app" },
  { value: `${TVASubtitleCodingCSuri}:9`, definition: "open" },
  { value: `${TVASubtitleCodingCSuri}:99`, definition: "other" },
];
export function SubtitleCodingCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, TVASubtitleCodingCSmap);
}

export const MPEG7AudioPresentationCSuri =
  "urn:mpeg:mpeg7:cs:AudioPresentationCS:2007";
export const MPEG7AudioPresentationCSmap: CSMapEntry[] = [
  { value: `${MPEG7AudioPresentationCSuri}:1`, definition: "none" },
  { value: `${MPEG7AudioPresentationCSuri}:2`, definition: "mono" },
  { value: `${MPEG7AudioPresentationCSuri}:3`, definition: "stereo" },
  { value: `${MPEG7AudioPresentationCSuri}:4`, definition: "surround" },
  { value: `${MPEG7AudioPresentationCSuri}:5`, definition: "home" },
  { value: `${MPEG7AudioPresentationCSuri}:6`, definition: "movie" },
];
export function AudioPresentationCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, MPEG7AudioPresentationCSmap);
}

export const MPEG7AudioCodingCSuri =
  "urn:mpeg:mpeg7:cs:AudioCodingFormatCS:2001";
export const MPEG7AudioCodingCSmap: CSMapEntry[] = [
  { value: `${MPEG7AudioCodingCSuri}:1`, definition: "AC3" },
  { value: `${MPEG7AudioCodingCSuri}:2`, definition: "DTS" },
  { value: `${MPEG7AudioCodingCSuri}:3.1`, definition: "MP1-L1" },
  { value: `${MPEG7AudioCodingCSuri}:3.2`, definition: "MP1-L1" }, // Note: Original has L1, L2, L3 for MP1. Assuming L1 for all for now.
  { value: `${MPEG7AudioCodingCSuri}:3.3`, definition: "MP1-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.1`, definition: "MP2-LSR-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.2`, definition: "MP2-LSR-L2" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.3`, definition: "MP2-LSR-L3" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.1`, definition: "MP2-BCmc-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.2`, definition: "MP2-BCmc-L2" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.3`, definition: "MP2-BCmc-L3" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.1`, definition: "AAC-LC" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.2`, definition: "AAC-MP" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.3`, definition: "AAC=SP" }, // Typo in original? Assuming AAC-SP
  { value: `${MPEG7AudioCodingCSuri}:4.4`, definition: "MP3" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.1`, definition: "MP4-Synth-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.2`, definition: "MP4-Synth-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.3`, definition: "MP4-Synth-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.2.1`, definition: "MP4-Speech-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.2.2`, definition: "MP4-Speech-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.1`, definition: "MP4-Scale-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.2`, definition: "MP4-Scale-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.3`, definition: "MP4-Scale-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.4`, definition: "MP4-Scale-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.1`, definition: "MP4-Main-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.2`, definition: "MP4-Main-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.3`, definition: "MP4-Main-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.4`, definition: "MP4-Main-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.1`, definition: "MP4-HQ-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.2`, definition: "MP4-HQ-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.3`, definition: "MP4-HQ-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.4`, definition: "MP4-HQ-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.5`, definition: "MP4-HQ-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.6`, definition: "MP4-HQ-L6" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.7`, definition: "MP4-HQ-L7" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.8`, definition: "MP4-HQ-L8" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.1`, definition: "MP4-LD-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.2`, definition: "MP4-LD-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.3`, definition: "MP4-LD-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.4`, definition: "MP4-LD-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.5`, definition: "MP4-LD-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.6`, definition: "MP4-LD-L6" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.7`, definition: "MP4-LD-L7" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.8`, definition: "MP4-LD-L8" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.1`, definition: "MP4-NA-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.2`, definition: "MP4-NA-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.3`, definition: "MP4-NA-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.4`, definition: "MP4-NA-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.1`, definition: "MP4-MAI-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.2`, definition: "MP4-MAI-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.3`, definition: "MP4-MAI-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.4`, definition: "MP4-MAI-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.5`, definition: "MP4-MAI-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.6`, definition: "MP4-MAI-L6" },
  { value: `${MPEG7AudioCodingCSuri}:6`, definition: "AMR" },
  { value: `${MPEG7AudioCodingCSuri}:7.1`, definition: "G.723" },
  { value: `${MPEG7AudioCodingCSuri}:7.2`, definition: "G.726" },
  { value: `${MPEG7AudioCodingCSuri}:7.3`, definition: "G.728" },
  { value: `${MPEG7AudioCodingCSuri}:7.4`, definition: "G.729" },
  { value: `${MPEG7AudioCodingCSuri}:8`, definition: "PCM" },
  { value: `${MPEG7AudioCodingCSuri}:10`, definition: "ATRAC" },
  { value: `${MPEG7AudioCodingCSuri}:11`, definition: "ATRAC2" },
  { value: `${MPEG7AudioCodingCSuri}:12`, definition: "ATRAC3" },
];

export const DVBAudioCodecCS2007uri = "urn:dvb:metadata:cs:AudioCodecCS:2007";
export const DVBAudioCodecCS2007map: CSMapEntry[] = [
  { value: `${DVBAudioCodecCS2007uri}:1.1.1`, definition: "MP4-Adv-L1" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.2`, definition: "MP4-Adv-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.3`, definition: "MP4-Adv-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.4`, definition: "MP4-Adv-L5" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.2`, definition: "MP4-HE-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.3`, definition: "MP4-HE-L3" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.4`, definition: "MP4-HE-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.5`, definition: "MP4-HE-L5" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.5`, definition: "MP4-HE-L5" }, // Duplicate in original
  { value: `${DVBAudioCodecCS2007uri}:1.3.2`, definition: "MP4-HEv2-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.3`, definition: "MP4-HEv2-L3" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.4`, definition: "MP4-HEv2-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.5`, definition: "MP4-HEv2-L5" },
  { value: `${DVBAudioCodecCS2007uri}:2.1`, definition: "AMR-WB+" },
  { value: `${DVBAudioCodecCS2007uri}:3.1`, definition: "E-AC3" },
];

export const DVBAudioCodecCS2020uri = "urn:dvb:metadata:cs:AudioCodecCS:2020";
export const DVBAudioCodecCS2020map: CSMapEntry[] = [
  { value: `${DVBAudioCodecCS2020uri}:1.1.1`, definition: "MP4-Adv-L1" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.2`, definition: "MP4-Adv-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.3`, definition: "MP4-Adv-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.4`, definition: "MP4-Adv-L5" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.2`, definition: "MP4-HE-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.3`, definition: "MP4-HE-L3" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.4`, definition: "MP4-HE-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.5`, definition: "MP4-HE-L5" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.2`, definition: "MP4-HEv2-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.3`, definition: "MP4-HEv2-L3" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.4`, definition: "MP4-HEv2-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.5`, definition: "MP4-HEv2-L5" },
  { value: `${DVBAudioCodecCS2020uri}:2.1`, definition: "AMR-WB+" },
  { value: `${DVBAudioCodecCS2020uri}:3.1`, definition: "E-AC3" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.1`, definition: "AC4-CIP-L0" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.2`, definition: "AC4-CIP-L1" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.3`, definition: "AC4-CIP-L2" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.4`, definition: "AC4-CIP-L3" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.1`, definition: "DTS-HD Core" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.2`, definition: "DTS-HD LBR" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.3`, definition: "DTS-HD Core+Ext" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.4`, definition: "DTS-HD Lossless" },
  { value: `${DVBAudioCodecCS2020uri}:5.2.1`, definition: "DTS-UHD 2" },
  { value: `${DVBAudioCodecCS2020uri}:5.2.2`, definition: "DTS-UHD 3" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.1`, definition: "MPEG-H 3D LC-1" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.2`, definition: "MPEG-H 3D LC-2" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.3`, definition: "MPEG-H 3D LC-3" },
];
export const AllAudioTerms: CSMapEntry[] = MPEG7AudioCodingCSmap.concat(
  DVBAudioCodecCS2020map,
).concat(DVBAudioCodecCS2007map);
export function AudioCodingCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, AllAudioTerms);
}

export const DVBVideoCodecCSuri = "urn:dvb:metadata:cs:VideoCodecCS:2022";
export const DVBVideoCodecCSmap: CSMapEntry[] = [
  { value: `${DVBVideoCodecCSuri}:1.1.1`, definition: "H.264-base-L1" },
  { value: `${DVBVideoCodecCSuri}:1.1.2`, definition: "H.264-base-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.1.3`, definition: "H.264-base-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.4`, definition: "H.264-base-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.5`, definition: "H.264-base-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.1.6`, definition: "H.264-base-L2" },
  { value: `${DVBVideoCodecCSuri}:1.1.7`, definition: "H.264-base-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.8`, definition: "H.264-base-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.9`, definition: "H.264-base-L3" },
  { value: `${DVBVideoCodecCSuri}:1.1.10`, definition: "H.264-base-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.11`, definition: "H.264-base-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.12`, definition: "H.264-base-L4" },
  { value: `${DVBVideoCodecCSuri}:1.1.13`, definition: "H.264-base-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.14`, definition: "H.264-base-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.15`, definition: "H.264-base-L4" },
  { value: `${DVBVideoCodecCSuri}:1.1.16`, definition: "H.264-base-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.1`, definition: "H.264-main-L1" },
  { value: `${DVBVideoCodecCSuri}:1.2.2`, definition: "H.264-main-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.2.3`, definition: "H.264-main-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.4`, definition: "H.264-main-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.5`, definition: "H.264-main-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.2.6`, definition: "H.264-main-L2" },
  { value: `${DVBVideoCodecCSuri}:1.2.7`, definition: "H.264-main-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.8`, definition: "H.264-main-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.9`, definition: "H.264-main-L3" },
  { value: `${DVBVideoCodecCSuri}:1.2.10`, definition: "H.264-main-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.11`, definition: "H.264-main-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.12`, definition: "H.264-main-L4" },
  { value: `${DVBVideoCodecCSuri}:1.2.13`, definition: "H.264-main-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.14`, definition: "H.264-main-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.15`, definition: "H.264-main-L4" },
  { value: `${DVBVideoCodecCSuri}:1.2.16`, definition: "H.264-main-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.1`, definition: "H.264-ext-L1" },
  { value: `${DVBVideoCodecCSuri}:1.3.2`, definition: "H.264-ext-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.3.3`, definition: "H.264-ext-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.4`, definition: "H.264-ext-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.5`, definition: "H.264-ext-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.3.6`, definition: "H.264-ext-L2" },
  { value: `${DVBVideoCodecCSuri}:1.3.7`, definition: "H.264-ext-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.8`, definition: "H.264-ext-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.9`, definition: "H.264-ext-L3" },
  { value: `${DVBVideoCodecCSuri}:1.3.10`, definition: "H.264-ext-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.11`, definition: "H.264-ext-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.12`, definition: "H.264-ext-L4" },
  { value: `${DVBVideoCodecCSuri}:1.3.13`, definition: "H.264-ext-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.14`, definition: "H.264-ext-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.15`, definition: "H.264-ext-L4" },
  { value: `${DVBVideoCodecCSuri}:1.3.16`, definition: "H.264-ext-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.1`, definition: "H.264-high-L1" },
  { value: `${DVBVideoCodecCSuri}:1.4.2`, definition: "H.264-high-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.4.3`, definition: "H.264-high-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.4`, definition: "H.264-high-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.5`, definition: "H.264-high-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.4.6`, definition: "H.264-high-L2" },
  { value: `${DVBVideoCodecCSuri}:1.4.7`, definition: "H.264-high-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.8`, definition: "H.264-high-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.9`, definition: "H.264-high-L3" },
  { value: `${DVBVideoCodecCSuri}:1.4.10`, definition: "H.264-high-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.11`, definition: "H.264-high-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.12`, definition: "H.264-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.4.13`, definition: "H.264-high-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.14`, definition: "H.264-high-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.15`, definition: "H.264-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.4.16`, definition: "H.264-high-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.1`, definition: "H.264-high10-L1" },
  { value: `${DVBVideoCodecCSuri}:1.5.2`, definition: "H.264-high10-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.5.3`, definition: "H.264-high10-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.4`, definition: "H.264-high10-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.5`, definition: "H.264-high10-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.5.6`, definition: "H.264-high10-L2" },
  { value: `${DVBVideoCodecCSuri}:1.5.7`, definition: "H.264-high10-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.8`, definition: "H.264-high10-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.9`, definition: "H.264-high10-L3" },
  { value: `${DVBVideoCodecCSuri}:1.5.10`, definition: "H.264-high10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.11`, definition: "H.264-high10-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.12`, definition: "H.264-high10-L4" },
  { value: `${DVBVideoCodecCSuri}:1.5.13`, definition: "H.264-high10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.14`, definition: "H.264-high10-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.15`, definition: "H.264-high10-L4" },
  { value: `${DVBVideoCodecCSuri}:1.5.16`, definition: "H.264-high10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.1`, definition: "H.264-high422-L1" },
  { value: `${DVBVideoCodecCSuri}:1.6.2`, definition: "H.264-high422-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.6.3`, definition: "H.264-high422-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.4`, definition: "H.264-high422-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.5`, definition: "H.264-high422-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.6.6`, definition: "H.264-high422-L2" },
  { value: `${DVBVideoCodecCSuri}:1.6.7`, definition: "H.264-high422-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.8`, definition: "H.264-high422-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.9`, definition: "H.264-high422-L3" },
  { value: `${DVBVideoCodecCSuri}:1.6.10`, definition: "H.264-high422-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.11`, definition: "H.264-high422-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.12`, definition: "H.264-high422-L4" },
  { value: `${DVBVideoCodecCSuri}:1.6.13`, definition: "H.264-high422-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.14`, definition: "H.264-high422-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.15`, definition: "H.264-high422-L4" },
  { value: `${DVBVideoCodecCSuri}:1.6.16`, definition: "H.264-high422-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.1`, definition: "H.264-high444-L1" },
  { value: `${DVBVideoCodecCSuri}:1.7.2`, definition: "H.264-high444-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.7.3`, definition: "H.264-high444-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.4`, definition: "H.264-high444-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.5`, definition: "H.264-high444-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.7.6`, definition: "H.264-high444-L2" },
  { value: `${DVBVideoCodecCSuri}:1.7.7`, definition: "H.264-high444-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.8`, definition: "H.264-high444-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.9`, definition: "H.264-high444-L3" },
  { value: `${DVBVideoCodecCSuri}:1.7.10`, definition: "H.264-high444-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.11`, definition: "H.264-high444-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.12`, definition: "H.264-high444-L4" },
  { value: `${DVBVideoCodecCSuri}:1.7.13`, definition: "H.264-high444-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.14`, definition: "H.264-high444-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.15`, definition: "H.264-high444-L4" },
  { value: `${DVBVideoCodecCSuri}:1.7.16`, definition: "H.264-high444-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.9`, definition: "H.264-scal-high-L3" },
  { value: `${DVBVideoCodecCSuri}:1.8.10`, definition: "H.264-scal-high-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.11`, definition: "H.264-scal-high-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.8.12`, definition: "H.264-scal-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.8.13`, definition: "H.264-scal-high-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.14`, definition: "H.264-scal-high-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.9.9`, definition: "H.264-stereo-high-L3" },
  {
    value: `${DVBVideoCodecCSuri}:1.9.10`,
    definition: "H.264-stereo-high-L3.1",
  },
  {
    value: `${DVBVideoCodecCSuri}:1.9.11`,
    definition: "H.264-stereo-high-L3.2",
  },
  { value: `${DVBVideoCodecCSuri}:1.9.12`, definition: "H.264-stereo-high-L4" },
  { value: `${DVBVideoCodecCSuri}:2.1.1`, definition: "VC1-simp-LL" },
  { value: `${DVBVideoCodecCSuri}:2.1.2`, definition: "VC1-simp-ML" },
  { value: `${DVBVideoCodecCSuri}:2.2.1`, definition: "VC1-main-LL" },
  { value: `${DVBVideoCodecCSuri}:2.2.2`, definition: "VC1-main-ML" },
  { value: `${DVBVideoCodecCSuri}:2.2.3`, definition: "VC1-main-HL" },
  { value: `${DVBVideoCodecCSuri}:2.3.1`, definition: "VC1-adv-L0" },
  { value: `${DVBVideoCodecCSuri}:2.3.2`, definition: "VC1-adv-L1" },
  { value: `${DVBVideoCodecCSuri}:2.3.3`, definition: "VC1-adv-L2" },
  { value: `${DVBVideoCodecCSuri}:2.3.4`, definition: "VC1-adv-L3" },
  { value: `${DVBVideoCodecCSuri}:2.3.5`, definition: "VC1-adv-L4" },
  { value: `${DVBVideoCodecCSuri}:3.1.1`, definition: "H.242-main-main" },
  { value: `${DVBVideoCodecCSuri}:3.1.2`, definition: "H.262-main-high" },
  { value: `${DVBVideoCodecCSuri}:4.1.1`, definition: "H.265-main-L1" },
  { value: `${DVBVideoCodecCSuri}:4.1.6`, definition: "H.265-main-L2" },
  { value: `${DVBVideoCodecCSuri}:4.1.7`, definition: "H.265-main-L2.1" },
  { value: `${DVBVideoCodecCSuri}:4.1.9`, definition: "H.265-main-L3" },
  { value: `${DVBVideoCodecCSuri}:4.1.10`, definition: "H.265-main-L3.1" },
  { value: `${DVBVideoCodecCSuri}:4.1.12`, definition: "H.265-main-L4" },
  { value: `${DVBVideoCodecCSuri}:4.1.13`, definition: "H.265-main-L4.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.1`, definition: "H.265-main10-L1" },
  { value: `${DVBVideoCodecCSuri}:4.2.6`, definition: "H.265-main10-L2" },
  { value: `${DVBVideoCodecCSuri}:4.2.7`, definition: "H.265-main10-L2.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.9`, definition: "H.265-main10-L3" },
  { value: `${DVBVideoCodecCSuri}:4.2.10`, definition: "H.265-main10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.12`, definition: "H.265-main10-L4" },
  { value: `${DVBVideoCodecCSuri}:4.2.13`, definition: "H.265-main10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.15`, definition: "H.265-main10-L5" },
  { value: `${DVBVideoCodecCSuri}:4.2.16`, definition: "H.265-main10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.17`, definition: "H.265-main10-L5.2" },
  { value: `${DVBVideoCodecCSuri}:4.2.18`, definition: "H.265-main10-L6" },
  { value: `${DVBVideoCodecCSuri}:4.2.19`, definition: "H.265-main10-L6.1" },
  { value: `${DVBVideoCodecCSuri}:5.1.1`, definition: "AVS3-high10-2.0.15" },
  { value: `${DVBVideoCodecCSuri}:5.1.2`, definition: "AVS3-high10-2.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.3`, definition: "AVS3-high10-2.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.4`, definition: "AVS3-high10-4.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.5`, definition: "AVS3-high10-4.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.6`, definition: "AVS3-high10-6.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.7`, definition: "AVS3-high10-6.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.8`, definition: "AVS3-high10-6.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.9`, definition: "AVS3-high10-6.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.10`, definition: "AVS3-high10-6.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.11`, definition: "AVS3-high10-6.4.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.12`, definition: "AVS3-high10-8.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.13`, definition: "AVS3-high10-8.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.14`, definition: "AVS3-high10-8.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.15`, definition: "AVS3-high10-8.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.16`, definition: "AVS3-high10-8.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.17`, definition: "AVS3-high10-8.4.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.18`, definition: "AVS3-high10-10.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.19`, definition: "AVS3-high10-10.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.20`, definition: "AVS3-high10-10.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.21`, definition: "AVS3-high10-10.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.22`, definition: "AVS3-high10-10.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.23`, definition: "AVS3-high10-10.4.120" },
  { value: `${DVBVideoCodecCSuri}:6.1.1`, definition: "VVC-main10-L3.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.2`, definition: "VVC-main10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.3`, definition: "VVC-main10-L4.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.4`, definition: "VVC-main10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.5`, definition: "VVC-main10-L5.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.6`, definition: "VVC-main10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.7`, definition: "VVC-main10-L5.2" },
  { value: `${DVBVideoCodecCSuri}:6.1.8`, definition: "VVC-main10-L6.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.9`, definition: "VVC-main10-L6.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.10`, definition: "VVC-main10-L6.2" },
];
export function VideoCodecCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, DVBVideoCodecCSmap);
}

export const TVASubtitlePurposeCSuri =
  "urn:tva:metadata:cs:SubtitlePurposeCS:2023";
export const TVASubtitlePurposeCSmap: CSMapEntry[] = [
  {
    value: `${TVASubtitlePurposeCSuri}:1`,
    definition: "~subtitle_purpose_translation",
  },
  {
    value: `${TVASubtitlePurposeCSuri}:2`,
    definition: "~subtitle_purpose_hard_of_hearing",
  },
  {
    value: `${TVASubtitlePurposeCSuri}:3`,
    definition: "~subtitle_purpose_audio_description",
  },
  {
    value: `${TVASubtitlePurposeCSuri}:4`,
    definition: "~subtitle_purpose_commentary",
  },
  {
    value: `${TVASubtitlePurposeCSuri}:5`,
    definition: "~subtitle_purpose_forced_narrative",
  },
];
export function SubtitlePurposeCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, TVASubtitlePurposeCSmap);
}

export const HbbTVStandard_uri =
  "urn:hbbtv:appinformation:standardversion:hbbtv";
export const CEAuri = "urn:cta:wave:appinformation:standardversion";
export const AppStandards_map: CSMapEntry[] = [
  { value: `${HbbTVStandard_uri}:1.2.1`, definition: "HbbTV 1.5" },
  { value: `${HbbTVStandard_uri}:1.5.1`, definition: "HbbTV 2.0.2" },
  { value: `${HbbTVStandard_uri}:1.6.1`, definition: "HbbTV 2.0.3" },
  { value: `${HbbTVStandard_uri}:1.7.1`, definition: "HbbTV 2.0.4" },
  { value: `${CEAuri}:cta5000:2017`, definition: "CTA-5000" },
  { value: `${CEAuri}:cta5000a:2018`, definition: "CTA-5000-A" },
  { value: `${CEAuri}:cta5000b:2019`, definition: "CTA-5000-B" },
  { value: `${CEAuri}:cta5000c:2020`, definition: "CTA-5000-C" },
  { value: `${CEAuri}:cta5000d:2021`, definition: "CTA-5000-D" },
  { value: `${CEAuri}:cta5000e:2022`, definition: "CTA-5000-E" },
  { value: `${CEAuri}:cta5000f:2023`, definition: "CTA-5000-F" },
];
export function StandardVersion(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, AppStandards_map);
}

export const HbbTVOption_uri = "urn:hbbtv:appinformation:optionalfeature:hbbtv";
export const OptionalFeatures_map: CSMapEntry[] = [
  { value: `${HbbTVOption_uri}:2decoder`, definition: "+2DECODER" },
  { value: `${HbbTVOption_uri}:2html`, definition: "+2HTML" },
  { value: `${HbbTVOption_uri}:graphics_01`, definition: "+GRAHICS_01" },
  { value: `${HbbTVOption_uri}:graphics_02`, definition: "+GRAHICS_02" },
  { value: `${HbbTVOption_uri}:aria`, definition: "+ARIA" },
];
export function OptionalFeature(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, OptionalFeatures_map);
}

export const AccessibilityPurposeCSuri =
  "urn:tva:metadata:cs:AccessibilityPurposeCS:2023";
export const AccessibilityPurposeCSmap: CSMapEntry[] = [
  {
    value: `${AccessibilityPurposeCSuri}:1.1`,
    definition: "~textMagnification",
  },
  { value: `${AccessibilityPurposeCSuri}:1.2`, definition: "~magnifierGlass" },
  { value: `${AccessibilityPurposeCSuri}:1.3`, definition: "~screenZoom" },
  { value: `${AccessibilityPurposeCSuri}:1.4`, definition: "~largeLayout" },
  { value: `${AccessibilityPurposeCSuri}:2.1`, definition: "~monochrome" },
  { value: `${AccessibilityPurposeCSuri}:3.1`, definition: "~maleVoice" },
  { value: `${AccessibilityPurposeCSuri}:3.2`, definition: "~femaleVoice" },
  {
    value: `${AccessibilityPurposeCSuri}:3.3`,
    definition: "~configurableVerbosity",
  },
  { value: `${AccessibilityPurposeCSuri}:3.4`, definition: "~speed" },
  { value: `${AccessibilityPurposeCSuri}:4.1`, definition: "~audio" },
  { value: `${AccessibilityPurposeCSuri}:4.2`, definition: "~visual" },
  { value: `${AccessibilityPurposeCSuri}:4.3`, definition: "~haptic" },
];
export function AccessibilityPurposeCS(
  vals: string | string[] | null | undefined,
): string | string[] | null {
  return mapValues(vals, AccessibilityPurposeCSmap);
}

// --- XML Parsing Helper Functions ---

export function getChildElements(
  parent: Element,
  tagName: string,
  namespaceURI?: string | null,
): Element[] {
  const matchingElements: Element[] = [];
  if (parent && parent.children) {
    for (let i = 0; i < parent.children.length; i++) {
      const childElement = parent.children[i];
      const localNameMatch = childElement.localName === tagName;
      // If namespaceURI is provided (not null/undefined), then match it. Otherwise (if undefined/null), it's a wildcard match for namespace.
      const namespaceMatch =
        namespaceURI === undefined || namespaceURI === null
          ? true
          : childElement.namespaceURI === namespaceURI;

      if (localNameMatch && namespaceMatch) {
        matchingElements.push(childElement);
      }
    }
  }
  return matchingElements;
}

export function getChildElement(
  parent: Element,
  tagName: string,
  namespaceURI?: string | null,
): Element | null {
  const children = getChildElements(parent, tagName, namespaceURI);
  return children.length > 0 ? children[0] : null;
}

export function getChildValue(
  element: Element | null,
  childElementName: string,
  namespaceURI?: string | null,
  attributeName?: string,
): string | null {
  if (!element) return null;
  const childElement = getChildElement(element, childElementName, namespaceURI);
  if (childElement) {
    if (attributeName) {
      return childElement.getAttribute(attributeName);
    }
    return childElement.textContent;
  }
  return null;
}

export function getChildValues(
  element: Element | null,
  childElementName: string,
  namespaceURI?: string | null,
  attributeName?: string,
): string[] {
  if (!element) return [];
  const children = getChildElements(element, childElementName, namespaceURI);
  return children
    .map((child) => {
      if (attributeName) {
        return child.getAttribute(attributeName);
      }
      return child.textContent;
    })
    .filter((value) => value !== null);
}

export function elementLanguage(element: Element | null): string {
  if (element == null) return "default";
  const lang = element.getAttributeNS(
    "http://www.w3.org/XML/1998/namespace",
    "lang",
  );
  if (lang) return lang;
  else return elementLanguage(element.parentElement);
}

export function getText(element: Element | null): LocalizedString | null {
  if (!element || !element.textContent) return null;
  return {
    lang: elementLanguage(element),
    text: element.textContent.trim(),
  };
}

export function getTexts(elements: Element[]): LocalizedString[] {
  return elements.map(getText).filter((lt) => lt !== null);
}

export function getMedia(element: Element | null): MediaRepresentation | null {
  if (!element) return null;
  // Use undefined for namespace to mimic wildcard matching for TVA elements
  const mediaUriEl = getChildElement(element, "MediaUri", undefined);
  if (mediaUriEl && mediaUriEl.textContent) {
    return { mediaUri: mediaUriEl.textContent.trim() };
  }
  return null;
}

export function parseTVAAudioAttributesType(
  audioAttributesElement: Element | null,
): AccessibilityAudioAttributes | undefined {
  if (!audioAttributesElement) return undefined;
  // Use undefined for namespace to mimic wildcard matching for TVA elements
  const codingVal = getChildValue(
    audioAttributesElement,
    "Coding",
    undefined,
    "href",
  );
  const mixTypeVal = getChildValue(
    audioAttributesElement,
    "MixType",
    undefined,
    "href",
  );

  return {
    coding: AudioCodingCS(codingVal) as string | undefined,
    mix_type: AudioPresentationCS(mixTypeVal) as string | undefined,
    language:
      getChildValue(audioAttributesElement, "AudioLanguage", undefined) ||
      undefined,
  };
}

export function accessibilityApplication(
  element: Element | null,
): string | undefined {
  if (!element) return undefined;
  // Use undefined for namespace to mimic wildcard matching for TVA elements
  const apps = getChildElements(element, "AppInformation", undefined);
  if (apps.length > 0) {
    const reqStdEl = getChildElement(
      apps[0],
      "RequiredStandardVersion",
      undefined,
    );

    let resolvedReqStd: string;
    if (reqStdEl && reqStdEl.textContent) {
      const sv = StandardVersion(reqStdEl.textContent); // sv is string | string[] | null
      if (typeof sv === "string") {
        resolvedReqStd = sv;
      } else if (Array.isArray(sv) && sv.length > 0) {
        resolvedReqStd = sv[0]; // Use the first element if it's an array
      } else {
        resolvedReqStd = "unspecified platform";
      }
    } else {
      resolvedReqStd = "unspecified platform";
    }

    const reqOptsEls = getChildElements(
      apps[0],
      "RequiredOptionalFeature",
      undefined,
    );
    const feat: string[] = [];
    reqOptsEls.forEach((optEl) => {
      if (optEl.textContent) {
        const mappedOpt = OptionalFeature(optEl.textContent); // mappedOpt is string | string[] | null
        if (typeof mappedOpt === "string") {
          feat.push(mappedOpt);
        } else if (Array.isArray(mappedOpt)) {
          feat.push(...mappedOpt); // Add all elements if it's an array of strings
        }
      }
    });
    return `${resolvedReqStd}${feat.length ? "; " : ""}${feat.join(", ")}`;
  }
  return undefined;
}

// Full implementation for ParseTVAAccessibilityAttributes
export function parseTVAAccessibilityAttributes(
  accessibilityElement: Element | null,
): AccessibilityAttributes | undefined {
  if (!accessibilityElement) return undefined;
  const res: AccessibilityAttributes = {};
  // Use undefined for namespace to mimic wildcard matching for TVA elements

  const subAttributesElements = getChildElements(
    accessibilityElement,
    "SubtitleAttributes",
    undefined,
  );
  if (subAttributesElements.length > 0) {
    res.subtitles = subAttributesElements.map((subEl) => {
      const subt: AccessibilitySubtitleAttributes = {
        language:
          getChildValue(subEl, "SubtitleLanguage", undefined) || undefined,
        carriage: SubtitleCarriageCS(
          getChildValues(subEl, "Carriage", undefined, "href"),
        ) as string[] | undefined,
        coding: SubtitleCodingCS(
          getChildValues(subEl, "Coding", undefined, "href"),
        ) as string[] | undefined,
        purpose: SubtitlePurposeCS(
          getChildValues(subEl, "Purpose", undefined, "href"),
        ) as string[] | undefined,
        forTTS: getChildValue(subEl, "SuitableForTTS", undefined) || undefined,
        app: accessibilityApplication(subEl),
      };
      return subt;
    });
  }

  const adAttributesElements = getChildElements(
    accessibilityElement,
    "AudioDescriptionAttributes",
    undefined,
  );
  if (adAttributesElements.length > 0) {
    res.audio_descriptions = adAttributesElements.map((adEl) => {
      const audioAttributes = getChildElement(
        adEl,
        "AudioAttributes",
        undefined,
      );
      const ad: AccessibilityAudioDescription = {
        audio_attributes: parseTVAAudioAttributesType(audioAttributes),
        mix: (
          getChildValue(adEl, "ReceiverMix", undefined) || "false"
        ).toLowerCase(),
        app: accessibilityApplication(adEl),
      };
      return ad;
    });
  }

  const signAttributesElements = getChildElements(
    accessibilityElement,
    "SigningAttributes",
    undefined,
  );
  if (signAttributesElements.length > 0) {
    res.signings = signAttributesElements.map((saEl) => {
      const sa: AccessibilitySigning = {
        coding: VideoCodecCS(
          getChildValue(saEl, "Coding", undefined, "href"),
        ) as string | undefined,
        language: getChildValue(saEl, "SignLanguage", undefined) || undefined,
        closed: getChildValue(saEl, "Closed", undefined) || undefined,
        app: accessibilityApplication(saEl),
      };
      return sa;
    });
  }

  const deAttributesElements = getChildElements(
    accessibilityElement,
    "DialogueEnhancementAttributes",
    undefined,
  );
  if (deAttributesElements.length > 0) {
    res.dialogue_enhancements = deAttributesElements.map((deEl) => ({
      audio_attributes: parseTVAAudioAttributesType(
        getChildElement(deEl, "AudioAttributes", undefined),
      ),
      app: accessibilityApplication(deEl),
    }));
  }

  const spokenSubAttributesElements = getChildElements(
    accessibilityElement,
    "SpokenSubtitlesAttributes",
    undefined,
  );
  if (spokenSubAttributesElements.length > 0) {
    res.spoken_subtitles = spokenSubAttributesElements.map((ssEl) => ({
      audio_attributes: parseTVAAudioAttributesType(
        getChildElement(ssEl, "AudioAttributes", undefined),
      ),
      app: accessibilityApplication(ssEl),
    }));
  }

  const createPurposeAppList = (
    els: Element[],
    _: string, // tagName parameter is not used in the original logic, kept for signature consistency if needed later
  ): AccessibilityAppAndPurpose[] => {
    return els.map((el) => ({
      app: accessibilityApplication(el),
      purpose: AccessibilityPurposeCS(
        getChildValues(el, "Purpose", undefined, "href"),
      ) as string[] | undefined,
    }));
  };

  res.magnification_ui = createPurposeAppList(
    getChildElements(
      accessibilityElement,
      "MagnificationUIAttributes",
      undefined,
    ),
    "MagnificationUIAttributes",
  );
  res.high_contrast_ui = createPurposeAppList(
    getChildElements(
      accessibilityElement,
      "HighContrastUIAttributes",
      undefined,
    ),
    "HighContrastUIAttributes",
  );
  res.screen_reader_ui = createPurposeAppList(
    getChildElements(accessibilityElement, "ScreenReaderAttributes", undefined),
    "ScreenReaderAttributes",
  );
  res.response_to_user_action_ui = createPurposeAppList(
    getChildElements(
      accessibilityElement,
      "ResponseToUserActionAttributes",
      undefined,
    ),
    "ResponseToUserActionAttributes",
  );

  // Filter out empty arrays
  if (res.magnification_ui?.length === 0) delete res.magnification_ui;
  if (res.high_contrast_ui?.length === 0) delete res.high_contrast_ui;
  if (res.screen_reader_ui?.length === 0) delete res.screen_reader_ui;
  if (res.response_to_user_action_ui?.length === 0)
    delete res.response_to_user_action_ui;

  return Object.keys(res).length > 0 ? res : undefined;
}
