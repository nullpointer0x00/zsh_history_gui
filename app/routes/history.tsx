import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "../components/ui/table"
import fs from "fs";
import path from "path";
import type {Route} from "./+types/history"

interface ZshHistoryEntry {
    timestamp: number;
    command: string;
}

export async function loader( {params} : Route.LoaderArgs) {

    const homeDirectory = process.env.HOME || "/home/user"; 
    const filePath = path.resolve(homeDirectory, ".zsh_history");

    const parseZshHistory = (filePath: string): ZshHistoryEntry[] => {
        try {
            const data = fs.readFileSync(filePath, "utf-8");
            const lines = data.split("\n");
            const history = lines
                .map((line) => {
                    const match = line.match(/^: (\d+):\d+;(.*)$/);
                    if (match) {
                        return {
                            timestamp: parseInt(match[1], 10),
                            command: match[2],
                        };
                    }
                    return null;
                })
                .filter((entry): entry is ZshHistoryEntry => entry !== null);
            return history;
        } catch (error) {
            console.error("Error reading or parsing .zsh_history:", error);
            return [];
        }
    };

    return await parseZshHistory(filePath);
}

export default function History({loaderData}: Route.ComponentProps) {
    return (
    <Table>
    <TableCaption>A list of your recent shell commands.</TableCaption>
    <TableHeader>
        <TableRow>
            <TableHead className="w-[200px]">Timestamp</TableHead>
            <TableHead>Command</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {loaderData.map((entry, index) => (
            <TableRow key={index}>
                <TableCell className="font-medium">{new Date(entry.timestamp * 1000).toLocaleString()}</TableCell>
                <TableCell>{entry.command}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
);
}