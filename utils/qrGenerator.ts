import crc from "crc";

/**
 * 
 * @param phone The Singapore number without +65
 * @param amount An amount MUST BE GREATER THAN 1
 * @param note A note to the payee MUST BE LESSER THAN 8 CHARACTERS
 * @param expiry An expiry in YYYYMMDD
 * @returns 
 */

const aWeekFromNow = (): string => {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export function generatePayNowQR(phone: string, amount: number, 
                                 note: string = 'paymeback Request', 
                                 expiry: string = aWeekFromNow()): string {

    const payString = '00020101021126500009SG.PAYNOW010100211+65' +
                       `${phone}030100408${expiry}5204000053037025404` +
                       `${amount}5802SG5902NA6009Singapore62080104` +
                       `${note}6304`;

    const crcValue = crc.crc16ccitt(Buffer.from(payString, 'utf-8'))
                        .toString(16).toUpperCase().padStart(4, "0");

    const fullPayload = payString + crcValue;

    return fullPayload;
}