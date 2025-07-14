import QRCode from "qrcode";
import crc from "crc";
import readlineSync from "readline-sync";

// TLV Helper
function TL(tag: string, value: string): string {
    return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
}

// Generate PayNow QR Payload
function generatePayNowQR(phone: string, amount: number, note: string, expiry = "20261212000800"): string {
    let payload = TL("00", "01");            // Payload Format Indicator
    payload += TL("01", "12");               // Point of Initiation Method: Dynamic

    const merchantInfo =
        TL("00", "SG.PAYNOW") +              // Globally Unique Identifier
        TL("01", "0") +                      // Proxy Type: Mobile
        TL("02", phone) +                    // Phone number
        TL("03", "1") +                      // Editable amount: true
        TL("04", expiry);                    // Expiry timestamp

    payload += TL("26", merchantInfo);       // Merchant Account Info
    payload += TL("52", "0000");             // Merchant Category Code
    payload += TL("53", "702");              // Currency (SGD)
    payload += TL("54", amount.toFixed(2));  // Amount
    payload += TL("58", "SG");               // Country Code
    payload += TL("59", "NA");               // Merchant Name
    payload += TL("60", "Singapore");        // Merchant City

    if (note) {
        payload += TL("62", TL("01", note)); // Additional data (note)
    }

    payload += "6304"; // CRC placeholder

    // CRC16-CCITT-FALSE
    const crcValue = crc.crc16ccitt(Buffer.from(payload, 'utf-8')).toString(16).toUpperCase().padStart(4, "0");

    const fullPayload = payload + crcValue;

    QRCode.toFile("paynow_qr.png", fullPayload, err => {
        if (err) throw err;
        console.log("QR Code saved to paynow_qr.png");
    });

    return fullPayload;
}

// --- Interactive CLI Logic ---
function getValidPhone(): string {
    while (true) {
        const input = readlineSync.question("Enter PayNow mobile number (e.g. +6590123456): ").trim();
        if (input.startsWith("+65") && input.length === 11) {
            return input;
        } else if (!input.startsWith("+65") && input.length === 8) {
            return "+65" + input;
        } else {
            console.log("Invalid phone number. It must start with '+65' and be 11 characters long.");
        }
    }
}

function getValidAmount(): number {
    while (true) {
        const input = readlineSync.question("Enter amount to request (e.g. 12.34): ").trim();
        const amount = parseFloat(input);
        if (!isNaN(amount) && amount > 0) {
            return amount;
        } else {
            console.log("Invalid amount. Please enter a positive number.");
        }
    }
}

function main() {
    const phone = getValidPhone();
    const amount = getValidAmount();
    const note = readlineSync.question("Enter reference (e.g. customer name, invoice ID): ").trim();

    const payload = generatePayNowQR(phone, amount, note);
    console.log("PayNow QR Payload:");
    console.log(payload);
}

main();
