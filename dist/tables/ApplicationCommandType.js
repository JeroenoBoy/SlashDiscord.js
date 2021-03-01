"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const table = new Map();
table.set(1, 'SUB_COMMAND');
table.set(2, 'SUB_COMMAND_GROUP');
table.set(3, 'STRING');
table.set(4, 'INTEGER');
table.set(5, 'BOOLEAN');
table.set(6, 'USER');
table.set(7, 'CHANNEL');
table.set(8, 'ROLE');
const reverseTable = new Map();
for (const [key, value] of table)
    reverseTable.set(value, key);
class ApplicationCommandOptionTable {
    static to(type) {
        return reverseTable.get(type);
    }
    static from(type) {
        return table.get(type);
    }
}
exports.default = ApplicationCommandOptionTable;
