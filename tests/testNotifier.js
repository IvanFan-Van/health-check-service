import { Notifier } from "../dist/src/notifier.js";
import * as dotenv from "dotenv";
dotenv.config();

// Notifier.getInstance().notify("Hello world");
Notifier.getInstance().notifyChat("Hello world");
