import express, { Request, Response } from "express";
import cors from "cors";
import { getSheetData } from "./sheetService";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

type UserDetails = {
  "Serial No": string;
  Name: string;
  Gender: string;
  Age: number;
  Mobile: number;
};

let cachedData: UserDetails[] = [];

const refreshSheetData = async (): Promise<void> => {
  try {
    const data: UserDetails[] = await getSheetData();
    cachedData = data || [];
    console.log("Google Sheets data refreshed.");
  } catch (error) {
    console.error("Error refreshing Google Sheets data:", error);
  }
};

refreshSheetData();

setInterval(refreshSheetData, 60000);

app.get("/api/greet", (req: Request, res: Response) => {
  res.json({ message: "Hello, World!" });
});

app.get("/detailsFromGoogleSheet", (req: Request, res: Response): void => {
  try {
    if (cachedData.length > 0) {
      res.status(200).json(cachedData);
    } else {
      res.status(404).json({ message: "No data available" });
    }
  } catch (error) {
    console.error("Error fetching cached data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
