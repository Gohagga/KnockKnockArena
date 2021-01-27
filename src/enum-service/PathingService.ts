import { Item } from "w3ts/index";

export class PathingService {

    public static item: Item;

    constructor() {
        PathingService.item = new Item(FourCC('I000'), 0, 0);
    }
}