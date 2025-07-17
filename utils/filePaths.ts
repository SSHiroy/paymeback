import { BillForm, User } from "@/types/types";
import { documentDirectory, EncodingType, getInfoAsync, makeDirectoryAsync, readAsStringAsync, readDirectoryAsync, writeAsStringAsync } from "expo-file-system";

export const jsonDir = documentDirectory + 'receiptJsons/';

export async function ensureDirExists() {
    try {
        const dirInfo = await getInfoAsync(jsonDir);
        
        if (!dirInfo.exists) {
            await makeDirectoryAsync(jsonDir, { intermediates: true });
        } else {
            // LEAVE APP OR TAB
        }
    } catch (error) {
        console.error("Error ensuring directory exists:", error);
    }
}

export async function saveOrUpdateUser(name: string, phoneNumber: string) {
    try {
        const json = JSON.stringify({name: name, phoneNumber: phoneNumber}, null, 2);
        await writeAsStringAsync(documentDirectory + 'user.json', json, {
            encoding: EncodingType.UTF8,
        });
        console.log('User file saved or updated.');
    } catch (error) {
        console.error('Error saving or updating user file:', error);
    }
}

export async function readUser(): Promise<User | null> {
    try {
        const fileUri = documentDirectory + 'user.json';
        const fileInfo = await getInfoAsync(fileUri);
        
        if (!fileInfo.exists) {
            console.warn('User file does not exist.');
            return null;
        }
        
        const json = await readAsStringAsync(fileUri, { encoding: EncodingType.UTF8 });
        const user: User = JSON.parse(json);
        return user;

    } catch (error) {
        console.error('Error reading user file:', error);
        return null;
    }
}

export async function createJson(data: any) {
    const now = new Date();
    const timestamp = now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0');
    const filePath = `${jsonDir}${timestamp}.json`;
    
    const jsonString = JSON.stringify(data);
    try {
        await writeAsStringAsync(filePath, jsonString, {
            encoding: EncodingType.UTF8,
        });
        
        const savedContent = await readAsStringAsync(filePath, { encoding: EncodingType.UTF8 });
        console.log(savedContent);
        
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

export async function logAllFiles() {
    try {
        await ensureDirExists();  // Ensure directory exists before reading
        const allFiles = await readDirectoryAsync(jsonDir);
    } catch (error) {
        console.error("Error reading documentDirectory:", error);
    }
}

export async function getLastCreatedFile() {
    try {
        await ensureDirExists();  // Make sure directory exists first
        console.log("Directory exists or has been created.");
        
        const files = await readDirectoryAsync(jsonDir);
        if (files.length === 0) {
            console.log("No files found.");
            return null;
        }
        
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        if (jsonFiles.length === 0) {
            console.log("No JSON files found.");
            return null;
        }
        
        jsonFiles.sort((a, b) => b.localeCompare(a));  // Sort files by timestamp in filename
        const latestFile = jsonFiles[0];
        const latestFilePath = `${jsonDir}${latestFile}`;
        
        // Correctly read the file content with await and full path
        const content = await readAsStringAsync(latestFilePath, { encoding: EncodingType.UTF8 });
        console.log("Last Created file content:", JSON.parse(content));
        
        return latestFilePath;
        
    } catch (error) {
        console.error("Error getting the latest created file: ", error);
        return null;
    }
}

export async function updateJson(bill: BillForm) {
    try {
        const filePath = await getLastCreatedFile();
        if (!filePath) throw new Error('No file path found.');
        
        await writeAsStringAsync(filePath, JSON.stringify(bill, null, 2));
    } catch (err) {
        console.error('Failed to save bill to file:', err);
    }
}