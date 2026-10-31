import assert from "node:assert/strict";
import {
  validateImage,
  detectImageMagicBytes,
  MAX_IMAGE_SIZE_BYTES,
} from "../src/lib/image-validator";

console.log("================================================================================");
console.log("🧪 BẮT ĐẦU CHẠY BỘ TEST: validateImage (MAGIC BYTES & ZERO-TRUST)");
console.log("================================================================================");

let passedCount = 0;

async function runTestCase(id: string, name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${id}: ${name}`);
    passedCount++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${id}: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  // 1. Tệp JPEG hợp lệ: Bắt đầu bằng FF D8 FF
  await runTestCase("TC-IMG-01", "Tệp JPEG hợp lệ với Magic Bytes FF D8 FF", async () => {
    const jpegBytes = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x60,
    ]);
    const result = await validateImage(jpegBytes);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.mimeType, "image/jpeg");
      assert.equal(result.extension, "jpg");
      assert.equal(result.size, jpegBytes.length);
    }
  });

  // 2. Tệp PNG hợp lệ: Bắt đầu bằng 89 50 4E 47 0D 0A 1A 0A
  await runTestCase("TC-IMG-02", "Tệp PNG hợp lệ với Magic Bytes 89 50 4E 47 0D 0A 1A 0A", async () => {
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
    ]);
    const result = await validateImage(pngBytes);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.mimeType, "image/png");
      assert.equal(result.extension, "png");
      assert.equal(result.size, pngBytes.length);
    }
  });

  // 3. Tệp WebP hợp lệ: RIFF....WEBP
  await runTestCase("TC-IMG-03", "Tệp WebP hợp lệ với Magic Bytes RIFF....WEBP", async () => {
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x20, 0x00, 0x00, 0x00, // file size chunk
      0x57, 0x45, 0x42, 0x50, // WEBP
      0x56, 0x50, 0x38, 0x20, // VP8
    ]);
    const result = await validateImage(webpBytes);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.mimeType, "image/webp");
      assert.equal(result.extension, "webp");
    }
  });

  // 4. Tệp giả đuôi .jpg chứa văn bản/HTML: Bị chặn BAD_TYPE
  await runTestCase("TC-IMG-04", "Tệp văn bản giả đuôi .jpg bị chặn vì sai Magic Bytes", async () => {
    const textBytes = new TextEncoder().encode("Hello this is plain text pretend to be image");
    const result = await validateImage(textBytes);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "BAD_TYPE");
    }
  });

  // 5. Tệp SVG (nguy cơ Stored XSS) bị từ chối thẳng thừng
  await runTestCase("TC-IMG-05", "Tệp SVG chứa mã XML / XSS bị từ chối triệt để", async () => {
    const svgBytes = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");
    const result = await validateImage(svgBytes);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "BAD_TYPE");
    }
  });

  // 6. Tệp vượt quá kích thước cho phép (> 5MB): Bị chặn TOO_LARGE
  await runTestCase("TC-IMG-06", "Tệp lớn hơn 5MB bị chặn với mã TOO_LARGE", async () => {
    // Giả lập Uint8Array kích thước 5MB + 1 byte
    const oversizedSize = MAX_IMAGE_SIZE_BYTES + 1;
    // Để không cấp phát 5MB RAM thực sự trong test, dùng options.maxSizeBytes nhỏ hoặc TypedArray
    const sampleBytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
    const result = await validateImage(sampleBytes, { maxSizeBytes: 3 });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "TOO_LARGE");
    }
  });

  // 7. Tệp rỗng 0 bytes: Bị chặn EMPTY_FILE
  await runTestCase("TC-IMG-07", "Tệp rỗng 0 bytes bị chặn với mã EMPTY_FILE", async () => {
    const emptyBytes = new Uint8Array(0);
    const result = await validateImage(emptyBytes);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "EMPTY_FILE");
    }
  });

  // 8. Tệp GIF hoặc EXE nhị phân bị từ chối (chỉ cho JPEG, PNG, WebP)
  await runTestCase("TC-IMG-08", "Tệp GIF (GIF89a) và tệp thực thi EXE (MZ) bị từ chối", async () => {
    const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00]);
    const resultGif = await validateImage(gifBytes);
    assert.equal(resultGif.ok, false);
    if (!resultGif.ok) {
      assert.equal(resultGif.code, "BAD_TYPE");
    }

    const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
    const resultExe = await validateImage(exeBytes);
    assert.equal(resultExe.ok, false);
    if (!resultExe.ok) {
      assert.equal(resultExe.code, "BAD_TYPE");
    }
  });

  console.log("\n================================================================================");
  console.log(`🎉 TẤT CẢ ${passedCount} CA KIỂM THỬ validateImage ĐÃ VƯỢT QUA 100%!`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Lỗi khi chạy bộ test validateImage:", err);
  process.exit(1);
});
