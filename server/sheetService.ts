const { google } = require("googleapis");

const keyFile = "./server/credentials.json";
const sheetId = "1uCojmAySPlWUoVA7c4jv_08gNPvsoMiX8jDoe5hilqM";

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

type PersonRow = {
  "Serial No": string;
  Name: string;
  Gender: string;
  Age: number;
  Mobile: number;
};

type SheetData = (string | number)[][];

const transformSheetData = (data: SheetData | undefined): PersonRow[] => {
  if (!data || data.length === 0) {
    throw new Error("No data found in the Google Sheet");
  }

  const [headers, ...rows] = data;
  return rows.map((row: (string | number)[]) => {
    const obj: PersonRow = {} as PersonRow;
    headers.forEach((header, index) => {
      const key = header as keyof PersonRow;
      if (key === "Age" || key === "Mobile") {
        obj[key] = Number(row[index]);
      } else {
        obj[key] = row[index] as string;
      }
    });
    return obj;
  });
};

export const getSheetData = async (): Promise<PersonRow[]> => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1",
    });
    const sheetData = response.data.values;

    if (!sheetData) {
      throw new Error("No data found in the sheet");
    }
    const transformedData = transformSheetData(sheetData);
    return transformedData;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw new Error("Failed to fetch data from Google Sheets");
  }
};
