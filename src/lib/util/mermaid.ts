graph TD;
    A[Wasserressourcen und Wassermangel]
    A1[Wasserknappheit (M1)]
    A2[Wassernutzung nach Region (M2)]
    A3[Wasser- und Nahrungsmittelsicherheit (M3)]
    A4[Ursachen von Wassermangel (M6)]

    A --> A1
    A --> A2
    A --> A3
    A --> A4

    A1 --> A1_1[2000]
    A1 --> A1_2[Prognose 2035]
    
    A1_1 --> A1_1_1[Extremer Wassermangel (5.3%)]
    A1_1 --> A1_1_2[Wasserknapp (8.6%)]
    A1_1 --> A1_1_3[Zeitweise Wasserknappheit (26.8%)]
    A1_1 --> A1_1_4[Ausreichende Verfügbarkeit (59.3%)]

    A1_2 --> A1_2_1[Extremer Wassermangel (10.5%)]
    A1_2 --> A1_2_2[Wasserknapp (19.5%)]
    A1_2 --> A1_2_3[Zeitweise Wasserknappheit (26.8%)]
    A1_2 --> A1_2_4[Ausreichende Verfügbarkeit (43.2%)]

    A2 --> A2_1[Afrika]
    A2 --> A2_2[Asien]
    A2 --> A2_3[Europa]
    A2 --> A2_4[Lateinamerika]
    A2 --> A2_5[Nordamerika]
    A2 --> A2_6[Australien und Ozeanien]
    A2 --> A2_7[Trends]

    A2_7 --> A2_7_1[Anstieg der Nutzung in Afrika und Asien]
    A2_7 --> A2_7_2[Stabilität in Europa und Nordamerika]

    A3 --> A3_1[Verschwendung]
    A3 --> A3_2[Verschmutzung]

    A3_1 --> A3_1_1[Ineffiziente Bewässerung]
    A3_1 --> A3_1_2[Verluste in Versorgungssystemen]
    A3_1 --> A3_1_3[Private Haushalte]
    A3_1 --> A3_1_4[Industrie]

    A3_2 --> A3_2_1[Industrielle Abwässer]
    A3_2 --> A3_2_2[Landwirtschaftliche Abflüsse]
    A3_2 --> A3_2_3[Haushaltsabwasser]
    A3_2 --> A3_2_4[Mangelnde Abwasserbehandlung]

    A4 --> A4_1[Natürliche Ursachen]
    A4 --> A4_2[Menschliche Ursachen]

    A4_1 --> A4_1_1[Dürreperioden]
    A4_1 --> A4_1_2[Klimawandel]
    A4_1 --> A4_1_3[Geringe Niederschläge]

    A4_2 --> A4_2_1[Übernutzung durch Landwirtschaft und Industrie]
    A4_2 --> A4_2_2[Bevölkerungswachstum]
    A4_2 --> A4_2_3[Urbanisierung]
