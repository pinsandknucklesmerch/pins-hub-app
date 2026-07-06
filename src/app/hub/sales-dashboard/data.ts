export type SalesYear = 2022 | 2023 | 2024 | 2025

export type YearSummaryRow = {
  year: SalesYear
  enquiries: number
  conversions: number
  profit: number
  profitPer: number
}

export type MonthlyComparisonRow = {
  month: string
  enquiries: Record<SalesYear, number>
  conversions: Record<SalesYear, number>
}

export type MonthlySalesRepRow = {
  month: string
  salesRep: string
  enquiries: number
  converted: number
  profit: number
  profitPer: number
}

export type SalesInboxRow = {
  month: string
  enquiries: number
  converted: number
}

export type SalesDashboardData = {
  activeYear: SalesYear
  yearSummary: YearSummaryRow[]
  monthlyComparison: MonthlyComparisonRow[]
  monthlySalesRepData: MonthlySalesRepRow[]
  salesInbox: SalesInboxRow[]
}

const monthlyRows = [
  ["January", 58, 76, 88, 96, 15, 21, 27, 31],
  ["February", 62, 80, 91, 102, 17, 24, 29, 34],
  ["March", 71, 92, 106, 118, 19, 27, 34, 39],
  ["April", 67, 88, 99, 112, 18, 26, 31, 36],
  ["May", 74, 94, 110, 124, 21, 29, 35, 41],
  ["June", 69, 90, 103, 116, 20, 28, 33, 38],
  ["July", 73, 96, 112, 126, 22, 31, 36, 42],
  ["August", 78, 101, 118, 132, 24, 32, 38, 44],
  ["September", 82, 106, 124, 139, 24, 33, 40, 46],
  ["October", 79, 104, 121, 135, 23, 32, 38, 44],
  ["November", 86, 112, 132, 148, 26, 35, 42, 49],
  ["December", 83, 107, 144, 124, 29, 49, 46, 42],
] as const

export const salesDashboardData: SalesDashboardData = {
  activeYear: 2025,
  yearSummary: [
    { year: 2022, enquiries: 842, conversions: 238, profit: 89420, profitPer: 376 },
    { year: 2023, enquiries: 1086, conversions: 327, profit: 129865, profitPer: 397 },
    { year: 2024, enquiries: 1248, conversions: 389, profit: 168610, profitPer: 433 },
    { year: 2025, enquiries: 1372, conversions: 446, profit: 206740, profitPer: 464 },
  ],
  monthlyComparison: monthlyRows.map(
    ([month, enquiries2022, enquiries2023, enquiries2024, enquiries2025, conversions2022, conversions2023, conversions2024, conversions2025]) => ({
      month,
      enquiries: {
        2022: enquiries2022,
        2023: enquiries2023,
        2024: enquiries2024,
        2025: enquiries2025,
      },
      conversions: {
        2022: conversions2022,
        2023: conversions2023,
        2024: conversions2024,
        2025: conversions2025,
      },
    }),
  ),
  monthlySalesRepData: [
    { month: "January", salesRep: "Amy", enquiries: 28, converted: 10, profit: 13200, profitPer: 1320 },
    { month: "January", salesRep: "Josh", enquiries: 24, converted: 8, profit: 8650, profitPer: 1081 },
    { month: "January", salesRep: "Mika", enquiries: 21, converted: 6, profit: 5620, profitPer: 937 },
    { month: "January", salesRep: "Sales Inbox", enquiries: 23, converted: 7, profit: 4820, profitPer: 689 },
    { month: "February", salesRep: "Amy", enquiries: 31, converted: 11, profit: 14680, profitPer: 1335 },
    { month: "February", salesRep: "Josh", enquiries: 26, converted: 9, profit: 9780, profitPer: 1087 },
    { month: "February", salesRep: "Mika", enquiries: 23, converted: 7, profit: 6510, profitPer: 930 },
    { month: "February", salesRep: "Sales Inbox", enquiries: 22, converted: 7, profit: 5010, profitPer: 716 },
    { month: "March", salesRep: "Amy", enquiries: 36, converted: 13, profit: 17140, profitPer: 1318 },
    { month: "March", salesRep: "Josh", enquiries: 31, converted: 10, profit: 11640, profitPer: 1164 },
    { month: "March", salesRep: "Mika", enquiries: 26, converted: 8, profit: 7860, profitPer: 983 },
    { month: "March", salesRep: "Sales Inbox", enquiries: 25, converted: 8, profit: 5480, profitPer: 685 },
    { month: "April", salesRep: "Amy", enquiries: 34, converted: 12, profit: 15980, profitPer: 1332 },
    { month: "April", salesRep: "Josh", enquiries: 29, converted: 9, profit: 10180, profitPer: 1131 },
    { month: "April", salesRep: "Mika", enquiries: 25, converted: 8, profit: 7420, profitPer: 928 },
    { month: "April", salesRep: "Sales Inbox", enquiries: 24, converted: 7, profit: 4960, profitPer: 709 },
    { month: "May", salesRep: "Amy", enquiries: 38, converted: 14, profit: 18620, profitPer: 1330 },
    { month: "May", salesRep: "Josh", enquiries: 33, converted: 11, profit: 12680, profitPer: 1153 },
    { month: "May", salesRep: "Mika", enquiries: 27, converted: 9, profit: 8360, profitPer: 929 },
    { month: "May", salesRep: "Sales Inbox", enquiries: 26, converted: 7, profit: 5230, profitPer: 747 },
    { month: "June", salesRep: "Amy", enquiries: 35, converted: 13, profit: 17380, profitPer: 1337 },
    { month: "June", salesRep: "Josh", enquiries: 31, converted: 10, profit: 11240, profitPer: 1124 },
    { month: "June", salesRep: "Mika", enquiries: 25, converted: 8, profit: 7680, profitPer: 960 },
    { month: "June", salesRep: "Sales Inbox", enquiries: 25, converted: 7, profit: 4890, profitPer: 699 },
    { month: "July", salesRep: "Amy", enquiries: 39, converted: 14, profit: 19340, profitPer: 1381 },
    { month: "July", salesRep: "Josh", enquiries: 34, converted: 11, profit: 13260, profitPer: 1205 },
    { month: "July", salesRep: "Mika", enquiries: 28, converted: 9, profit: 8640, profitPer: 960 },
    { month: "July", salesRep: "Sales Inbox", enquiries: 25, converted: 8, profit: 5440, profitPer: 680 },
    { month: "August", salesRep: "Amy", enquiries: 40, converted: 15, profit: 20180, profitPer: 1345 },
    { month: "August", salesRep: "Josh", enquiries: 35, converted: 12, profit: 13840, profitPer: 1153 },
    { month: "August", salesRep: "Mika", enquiries: 29, converted: 9, profit: 8820, profitPer: 980 },
    { month: "August", salesRep: "Sales Inbox", enquiries: 28, converted: 8, profit: 5830, profitPer: 729 },
    { month: "September", salesRep: "Amy", enquiries: 43, converted: 16, profit: 21880, profitPer: 1368 },
    { month: "September", salesRep: "Josh", enquiries: 37, converted: 12, profit: 14320, profitPer: 1193 },
    { month: "September", salesRep: "Mika", enquiries: 30, converted: 10, profit: 9510, profitPer: 951 },
    { month: "September", salesRep: "Sales Inbox", enquiries: 29, converted: 8, profit: 5920, profitPer: 740 },
    { month: "October", salesRep: "Amy", enquiries: 42, converted: 15, profit: 20420, profitPer: 1361 },
    { month: "October", salesRep: "Josh", enquiries: 36, converted: 12, profit: 13980, profitPer: 1165 },
    { month: "October", salesRep: "Mika", enquiries: 29, converted: 9, profit: 8740, profitPer: 971 },
    { month: "October", salesRep: "Sales Inbox", enquiries: 28, converted: 8, profit: 5720, profitPer: 715 },
    { month: "November", salesRep: "Amy", enquiries: 46, converted: 17, profit: 23600, profitPer: 1388 },
    { month: "November", salesRep: "Josh", enquiries: 39, converted: 13, profit: 15680, profitPer: 1206 },
    { month: "November", salesRep: "Mika", enquiries: 32, converted: 10, profit: 9820, profitPer: 982 },
    { month: "November", salesRep: "Sales Inbox", enquiries: 31, converted: 9, profit: 6280, profitPer: 698 },
    { month: "December", salesRep: "Amy", enquiries: 37, converted: 14, profit: 19020, profitPer: 1359 },
    { month: "December", salesRep: "Josh", enquiries: 31, converted: 10, profit: 11720, profitPer: 1172 },
    { month: "December", salesRep: "Mika", enquiries: 27, converted: 9, profit: 8210, profitPer: 912 },
    { month: "December", salesRep: "Sales Inbox", enquiries: 29, converted: 9, profit: 6120, profitPer: 680 },
  ],
  salesInbox: [
    { month: "January", enquiries: 23, converted: 7 },
    { month: "February", enquiries: 22, converted: 7 },
    { month: "March", enquiries: 25, converted: 8 },
    { month: "April", enquiries: 24, converted: 7 },
    { month: "May", enquiries: 26, converted: 7 },
    { month: "June", enquiries: 25, converted: 7 },
    { month: "July", enquiries: 25, converted: 8 },
    { month: "August", enquiries: 28, converted: 8 },
    { month: "September", enquiries: 29, converted: 8 },
    { month: "October", enquiries: 28, converted: 8 },
    { month: "November", enquiries: 31, converted: 9 },
    { month: "December", enquiries: 29, converted: 9 },
  ],
}
