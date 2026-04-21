import { PDFDocument } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt-lite";

async function test() {
  console.log("🛠️ Starting Encryption Verification System...");
  
  // 1. Create a simple PDF
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]).drawText("Verification Asset: SECURE");
  const originalBytes = await doc.save();
  console.log("✅ Original PDF generated.");

  // 2. Encrypt it
  const password = "test-password-123";
  const encryptedBytes = await encryptPDF(originalBytes, password);
  console.log("✅ Encryption engine applied.");

  // 3. Try to load without password
  try {
    await PDFDocument.load(encryptedBytes);
    console.error("❌ FAILURE: PDF loaded without password!");
  } catch (err) {
    console.log("✅ SUCCESS: PDF correctly blocked unauthorized access.");
  }

  // 4. Try to load with WRONG password
  try {
    await PDFDocument.load(encryptedBytes, { password: "wrong-password" });
    console.error("❌ FAILURE: PDF loaded with wrong password!");
  } catch (err) {
    console.log("✅ SUCCESS: Invalid credentials rejected.");
  }

  // 5. Try to load with CORRECT password
  try {
    const loadedDoc = await PDFDocument.load(encryptedBytes, { password });
    if (loadedDoc.getPageCount() === 1) {
      console.log("✅ SUCCESS: PDF unlocked with correct credentials.");
    } else {
       console.error("❌ FAILURE: Document structure corrupted!");
    }
  } catch (err) {
    console.error("❌ FAILURE: Valid password was rejected!", err);
  }

  console.log("🏁 Verification Suite Complete.");
}

test().catch(console.error);
