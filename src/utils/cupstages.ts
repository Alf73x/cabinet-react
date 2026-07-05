export function stageIndexToText(aiIndex: number): string {
  let result = "";

  switch (aiIndex) {
    case 1: return "Финал";
    case 2: return "1/2";
    case 3: return "1/4";
    case 4: return "1/8";
    case 5: return "1/16";
    case 6: return "1/32";
    case 7: return "1/64";
    case 8: return "1/128";
    case 9: return "1/256";
    case 10: return "1/512";
    case 11: return "1/1024";

    case 50: return "За 5-8 место";
    case 51: return "За 7 место";
    case 52: return "За 5 место";
    case 53:
    case 54: return "За 3 место";
    case 57: return "За 2 место";

    case 65: return "За 1 место";
    case 66: return "За 9 место";
    case 67: return "За 11 место";
    case 68: return "За 13 место";
    case 69: return "За 15 место";
    case 85: return "За 16 место";
    case 70: return "За 17 место";
    case 71: return "За 19 место";
    case 72: return "За 21 место";
    case 73: return "За 23 место";
    case 74: return "За 25 место";
    case 75: return "За 27 место";
    case 76: return "За 29 место";
    case 77: return "За 31 место";
    case 78: return "За 33 место";
    case 79: return "За 35 место";
    case 80: return "За 37 место";
    case 81: return "За 39 место";

    case 180: return "Путь регионов. 1-й раунд";
    case 181: return "Путь регионов. 2-й раунд";
    case 182: return "Путь регионов. 3-й раунд";
    case 183: return "Путь регионов. 4-й раунд";
    case 184: return "Путь регионов. 5-й раунд";
    case 185: return "Путь регионов. 6-й раунд";

    case 210: return "Путь РПЛ. Группа A";
    case 211: return "Путь РПЛ. Группа B";
    case 212: return "Путь РПЛ. Группа C";
    case 213: return "Путь РПЛ. Группа D";
    case 214: return "Путь РПЛ. 1/4 финала";
    case 215: return "Путь РПЛ. 1/2 финала";
    case 218: return "Путь РПЛ. Финал";

    case 225: return "Путь регионов. 1/4 финала. 1-й этап";
    case 226: return "Путь регионов. 1/4 финала. 2-й этап";
    case 227: return "Путь регионов. 1/2 финала. 1-й этап";
    case 228: return "Путь регионов. 1/2 финала. 2-й этап";
    case 229: return "Путь регионов. Финал";

    case 320: return "Группа A";
    case 321: return "Группа B";
    case 322: return "Группа C";
    case 323: return "Группа D";
    case 324: return "Группа E";
    case 325: return "Группа F";
    case 326: return "Группа G";
    case 327: return "Группа H";

    case 390: return "Этап победителей";
  }

  if (aiIndex >= 150 && aiIndex <= 175) {
    return `Элитный групповой раунд. Группа ${aiIndex - 150 + 1}`;
  }

  if (aiIndex >= 361 && aiIndex <= 370) {
    return `${aiIndex - 361 + 1} группа`;
  }

  if (aiIndex >= 400 && aiIndex <= 3699) {
    let sFirstPart = "";
    let sSecondPart = "";

    if (aiIndex >= 400 && aiIndex <= 499) sFirstPart = "";
    else if (aiIndex >= 500 && aiIndex <= 599) sFirstPart = "РСФСР";
    else if (aiIndex >= 600 && aiIndex <= 699) sFirstPart = "УССР";
    else if (aiIndex >= 700 && aiIndex <= 799) sFirstPart = "УССР. Зона Закарпатья";
    else if (aiIndex >= 800 && aiIndex <= 899) sFirstPart = "УССР. Зона Крыма";
    else if (aiIndex >= 900 && aiIndex <= 999) sFirstPart = "Средняя Азия";
    else if (aiIndex >= 1000 && aiIndex <= 1099) sFirstPart = "Средняя Азия и Казахстан";
    else if (aiIndex >= 1100 && aiIndex <= 1199) sFirstPart = "Союзные республики";
    else if (aiIndex >= 1200 && aiIndex <= 1299) sFirstPart = "Центральная зона";
    else if (aiIndex >= 1300 && aiIndex <= 1399) sFirstPart = "УССР";
    else if (aiIndex >= 1400 && aiIndex <= 1499) sFirstPart = "Украинская зона";
    else if (aiIndex >= 1500 && aiIndex <= 1599) sFirstPart = "Закавказская зона";
    else if (aiIndex >= 1600 && aiIndex <= 1699) sFirstPart = "Среднеазиатская зона";
    else if (aiIndex >= 1700 && aiIndex <= 1799) sFirstPart = "I зона, 1 группа. Москва";
    else if (aiIndex >= 1800 && aiIndex <= 1899) sFirstPart = "I зона, 2 группа. Москва";
    else if (aiIndex >= 1900 && aiIndex <= 1999) sFirstPart = "II зона, Ленинград";
    else if (aiIndex >= 2000 && aiIndex <= 2099) sFirstPart = "III зона, Воронеж";
    else if (aiIndex >= 2100 && aiIndex <= 2199) sFirstPart = "IV зона, Хабаровск";
    else if (aiIndex >= 2200 && aiIndex <= 2299) sFirstPart = "V зона, Новосибирск";
    else if (aiIndex >= 2300 && aiIndex <= 2399) sFirstPart = "VI зона, Свердловск";
    else if (aiIndex >= 2400 && aiIndex <= 2499) sFirstPart = "VII зона, Горький";
    else if (aiIndex >= 2500 && aiIndex <= 2599) sFirstPart = "VIII зона, Нижневолжская";
    else if (aiIndex >= 2600 && aiIndex <= 2699) sFirstPart = "IX зона, Ростов";
    else if (aiIndex >= 2700 && aiIndex <= 2799) sFirstPart = "X зона, Тбилиси";
    else if (aiIndex >= 2800 && aiIndex <= 2899) sFirstPart = "XI зона, Баку";
    else if (aiIndex >= 2900 && aiIndex <= 2999) sFirstPart = "XII зона, Ташкент";
    else if (aiIndex >= 3000 && aiIndex <= 3099) sFirstPart = "XIII зона, Минск";
    else if (aiIndex >= 3100 && aiIndex <= 3199) sFirstPart = "XIV зона, Харьков (1 зона УССР)";
    else if (aiIndex >= 3200 && aiIndex <= 3299) sFirstPart = "XV зона, Киев (2 зона УССР)";
    else if (aiIndex >= 3300 && aiIndex <= 3399) sFirstPart = "XVI зона, Одесса (3 зона УССР)";
    else if (aiIndex >= 3400 && aiIndex <= 3499) sFirstPart = "XVII зона, Днепропетровск (4 зона УССР)";
    else if (aiIndex >= 3500 && aiIndex <= 3599) sFirstPart = "XVIII зона, Сталино (5 зона УССР)";
    else if (aiIndex >= 3600 && aiIndex <= 3690) sFirstPart = "XIX зона, Симферополь";

    switch (aiIndex) {
      case 3696:
        return "XIV зона, Харьков (1 зона УССР). 1/512 финала";
      case 3697:
        return "XVIII зона, Сталино (5 зона УССР). 1/512 финала";
      case 3698:
        return "V зона, Новосибирск. 1/512 финала";
      case 3699:
        return "Стыковые игры победителей зон";
    }

    const mod = aiIndex % 10;

    switch (mod) {
      case 1: sSecondPart = "Финал"; break;
      case 2: sSecondPart = "1/2"; break;
      case 3: sSecondPart = "1/4"; break;
      case 4: sSecondPart = "1/8"; break;
      case 5: sSecondPart = "1/16"; break;
      case 6: sSecondPart = "1/32"; break;
      case 7: sSecondPart = "1/64"; break;
      case 8: sSecondPart = "1/128"; break;
      case 9: sSecondPart = "1/256"; break;
    }

    if (sFirstPart !== "") {
      sFirstPart += ". ";
    }

    const div10 = Math.floor(aiIndex / 10);
    const zoneNum = div10 % 10;

    if (zoneNum !== 0) {
      sFirstPart += `${zoneNum} зона. `;
    }

    result = sFirstPart + sSecondPart;
  }

  return result;
}