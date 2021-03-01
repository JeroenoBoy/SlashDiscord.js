"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const table = new Map();
table.set(1, 'Ping');
table.set(2, 'ApplicationCommand');
const reverseTable = new Map();
for (const [key, value] of table)
    reverseTable.set(value, key);
class InteractionTable {
    static to(type) {
        return reverseTable.get(type);
    }
    static from(type) {
        return table.get(type);
    }
}
exports.default = InteractionTable;
