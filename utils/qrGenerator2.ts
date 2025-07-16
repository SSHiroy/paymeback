import crc from "crc";


function TL(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

const aWeekFromNow = (): string => {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}000000`;
};


export function generatePayNowQR(
  phone: string,
  amount: number,
  note: string = "paymeback",
  expiry: string = aWeekFromNow()
): string {
  // Merchant Info (ID 26)
  const merchantInfo =
    TL("00", "SG.PAYNOW") +             // Globally Unique Identifier
    TL("01", "0") +                     // Proxy type: 0 = mobile
    TL("02", phone) +                  // Phone number
    TL("03", "1") +                     // Editable: 1 = true
    TL("04", expiry);                  // Expiry date YYYYMMDDHHMMSS

  // Full payload
  let payload =
    TL("00", "01") +                     // Payload format indicator
    TL("01", "12") +                     // Point of initiation method (dynamic)
    TL("26", merchantInfo) +            // Merchant Account Information
    TL("52", "0000") +                  // Merchant Category Code
    TL("53", "702") +                   // Currency code (702 = SGD)
    TL("54", amount.toFixed(2)) +       // Amount
    TL("58", "SG") +                    // Country Code
    TL("59", "NA") +                    // Merchant Name
    TL("60", "Singapore");              // Merchant City

  if (note) {
    payload += TL("62", TL("01", note));
  }

  // CRC tag
  payload += "6304";

  // Calculate checksum
  const crcValue = crc.crc16ccitt(Buffer.from(payload, 'utf-8'))
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

  const fullPayload = payload + crcValue;

  // console.log(`Generated PayNow QR payload:\n${fullPayload}`);

  return fullPayload;
}