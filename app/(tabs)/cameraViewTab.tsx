import { parseThis } from '@/utils/receiptParser';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import DocumentScanner from 'react-native-document-scanner-plugin';

export default function CameraViewTab() {
	const router = useRouter();
	const [scannedImage, setScannedImage] = useState<string | null>(null);
	
	// Document scanning function
	const scanDocument = async () => {
		try {
			const { scannedImages } = await DocumentScanner.scanDocument({
				maxNumDocuments: 1,
			});
			
			if (!scannedImages || scannedImages.length === 0) {
				console.log("No documents found.");
				router.back();
			} else {
				setScannedImage(scannedImages[0]);
			}
		} catch (error) {
			console.error("Document scanning failed: ", error);
		}
	};
	
	useEffect(() => {
		scanDocument();
	}, []);
	
	useEffect(() => {
		const recognizeText = async () => {
			if (scannedImage) {
				try {
					const parsedData = await parseThis(scannedImage);
					if (parsedData) {
						router.push("/billReview");
					}
				} catch (error) {
					console.error("Text recognition failed: ", error);
				}
			}
		};
		recognizeText();
	}, [scannedImage]);
	
	return;
}