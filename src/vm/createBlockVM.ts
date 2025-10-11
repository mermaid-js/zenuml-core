import { BlockVM } from "./BlockVM";

export const createBlockVM = (context: any): BlockVM => new BlockVM(context);
