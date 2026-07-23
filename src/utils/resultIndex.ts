import {
  GsSportPlace,
  GsSportMatchPlayoff,
  GsSportQualificationToPromotion,
  GsSportQualificationToRelegation,
  GsSportPromotion,
  GsSportFinal,
  GsSportSemifinal,
  GsSportQuarterfinal,
  GsSportAdditionalMatches,
  GsSportPromotionTheSameLeague,
  GsSportRelegation,
  GsSportDissolution,
  GsSportExclusion,
  GsSportRefused,
  GsSportWithdrew,
  GsSportWithdrewAndAnnulled,
  GsSportNoLicense,
  GsSportMerged,
  GsSportLossStatus,
  GsSportMovingToAnotherLeague,
  GsSportRelegationZone,
  GsSportPromotionCandidate,
  GsSportRelegationCandidate,
  GsSportDisappearance,
  GsSportRelegation2,
} from "../texts/texts";

export const kQualificationToRelegation = 27;

export const kPromotion1 = 40;
export const kPromotion2 = 41;
export const kPromotion3 = 42;

export const kAdditionalMatches = 46;
export const kSportPromotionTheSameLeague = 47;

export const kRelegation = 50;
export const kRelegation2 = 65;
export const kRelegation3 = 66;

export const kRasformirovanie = 51;
export const kExclusion = 52;
export const kRefused = 53;
export const kWithdrew = 54;
export const kWithdrewResultsAnnulled = 55;
export const kDidNotObtainALicense = 56;
export const kMerged = 57;
export const kLossOfProfessionalStatus = 58;
export const kMovingToAnotherLeague = 60;
export const kDisappearance = 64;

export function getSportTableIndexColor(
  index: number,
  defaultColor = "transparent",
): string {
  switch (index) {
    case 1:
      return "#F7F7A8";

    case 2:
      return "#DCE5E5";

    case 3:
      return "#FFDAB8";

    case 20: // Playoff
    case 22: // 1/2
      return "#CCFFCC";

    case 23: // 1/4
      return "#BAFEED";

    case 24: // 1/8
      return "#CBFEF1";

    case 25: // 1/16
      return "#E0FEF7";

    case 26: // 1/32
      return "#F0FFFC";

    case 21: // Qualification to Promotion
      return "#FFFFBB";

    case kQualificationToRelegation:
      return "#FFB3AA";

    case kPromotion1:
      return "#8FEE8F";

    case kPromotion2:
      return "#6AD2A6";

    case kPromotion3:
      return "#7CD8B0";

    case 43:
    case 44:
    case 45:
      return "#D9FFD9";

    case kAdditionalMatches:
      return "#BADCBC";

    case kSportPromotionTheSameLeague:
      return "#B0E0E6";

    case kRelegation:
      return "#FFCCCC";

    case kRelegation2:
    case kRelegation3:
    case kRasformirovanie:
      return "#FF758F";

    case kExclusion:
      return "#FF8FA3";

    case kRefused:
      return "#FFFF00";

    case kWithdrew:
    case kLossOfProfessionalStatus:
      return "#FFCCD5";

    case kWithdrewResultsAnnulled:
      return "#EAEAEA";

    case kDidNotObtainALicense:
      return "#F7B267";

    case kMerged:
      return "#F79D65";

    case kMovingToAnotherLeague:
      return "#FFE4E1"; // MistyRose

    case 61:
      return "#F5F5F5"; // WhiteSmoke

    case 62:
    case 63:
      return "#E0FFFF"; // LightCyan

    case kDisappearance:
      return "#FFD7A6";

    case 100:
      return "#ACE1AF";

    case 101:
      return "#D0F0C0";

    case 110:
    case 114:
      return "#B6D8FA";

    case 111:
    case 112:
      return "#D9EBFF";

    case 130:
      return "#CCF3FF";

    case 140:
      return "#FFFF99";

    case 150:
      return "#CCCCFF";

    default:
      return defaultColor;
  }
}

export function getRoundStandingColor(place: number): string {
  if (place <= 0) {
    // отрицательные места = вылет
    return getSportTableIndexColor(kRelegation, "transparent");
  }

  switch (place) {
    case 1:
      return getSportTableIndexColor(1, "transparent");

    case 2:
      return getSportTableIndexColor(2, "transparent");

    case 3:
      return getSportTableIndexColor(3, "transparent");

    default:
      return "transparent";
  }
}

export function tableResultToText(id: number): string {
  switch (id) {
    case 1:
      return `${GsSportPlace} 1`;

    case 2:
      return `${GsSportPlace} 2`;

    case 3:
      return `${GsSportPlace} 3`;

    case 20:
      return GsSportMatchPlayoff;

    case 21:
      return GsSportQualificationToPromotion;

    case 22:
      return "1/2";

    case 23:
      return "1/4";

    case 24:
      return "1/8";

    case 25:
      return "1/16";

    case 26:
      return "1/32";

    case kQualificationToRelegation:
      return GsSportQualificationToRelegation;

    case kPromotion1:
      return GsSportPromotion;

    case kPromotion2:
      return `${GsSportPromotion} +2`;

    case kPromotion3:
      return `${GsSportPromotion} +N`;

    case 43:
      return GsSportFinal;

    case 44:
      return GsSportSemifinal;

    case 45:
      return GsSportQuarterfinal;

    case kAdditionalMatches:
      return GsSportAdditionalMatches;

    case kSportPromotionTheSameLeague:
      return GsSportPromotionTheSameLeague;

    case kRelegation:
      return GsSportRelegation;

    case kRasformirovanie:
      return GsSportDissolution;

    case kExclusion:
      return GsSportExclusion;

    case kRefused:
      return GsSportRefused;

    case kWithdrew:
      return GsSportWithdrew;

    case kWithdrewResultsAnnulled:
      return GsSportWithdrewAndAnnulled;

    case kDidNotObtainALicense:
      return GsSportNoLicense;

    case kMerged:
      return GsSportMerged;

    case kLossOfProfessionalStatus:
      return GsSportLossStatus;

    case kMovingToAnotherLeague:
      return GsSportMovingToAnotherLeague;

    case 61:
      return GsSportRelegationZone;

    case 62:
      return GsSportPromotionCandidate;

    case 63:
      return GsSportRelegationCandidate;

    case kDisappearance:
      return GsSportDisappearance;

    case kRelegation2:
      return `${GsSportRelegation2} -2`;

    case kRelegation3:
      return `${GsSportRelegation2} -N`;

    default:
      return "";
  }
}
