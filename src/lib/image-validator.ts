/**
 * Module kiểm định tính hợp lệ và an toàn của ảnh (Image Validator)
 * Tuân thủ nguyên tắc Zero-Trust:
 * 1. Không tin tưởng Content-Type từ Client.
 * 2. Không tin tưởng phần mở rộng (.jpg, .png...) của tên file.
 * 3. Kiểm định trực tiếp qua chữ ký nhị phân (Magic Bytes / File Signature).
 * 4. Hiệu năng cao: Chỉ đọc 12 byte đầu tiên của file để kiểm tra magic bytes,
 *    không nạp toàn bộ nội dung file lớn vào RAM.
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type AllowedMimeType = "image/jpeg" | "image/png" | "image/webp";
export type AllowedExtension = "jpg" | "png" | "webp";

export interface ValidateImageSuccess {
  ok: true;
  mimeType: AllowedMimeType;
  extension: AllowedExtension;
  size: number;
}

export interface ValidateImageFailure {
  ok: false;
  code: "EMPTY_FILE" | "TOO_LARGE" | "BAD_TYPE" | "INVALID_INPUT";
  message: string;
}

export type ValidateImageResult = ValidateImageSuccess | ValidateImageFailure;

export interface ValidateImageOptions {
  maxSizeBytes?: number;
  fileName?: string;
}

/**
 * Kiểm tra mảng byte chữ ký (Magic Bytes)
 * - JPEG: FF D8 FF
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - WebP: 52 49 46 46 (RIFF) tại byte 0-3 và 57 45 42 50 (WEBP) tại byte 8-11
 */
export function detectImageMagicBytes(
  header: Uint8Array
): { mimeType: AllowedMimeType; extension: AllowedExtension } | null {
  if (!header || header.length < 12) {
    // Nếu file quá ngắn (< 12 byte), không thể là một file ảnh hợp lệ
    return null;
  }

  // 1. Kiểm tra JPEG: [0xFF, 0xD8, 0xFF]
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  // 2. Kiểm tra PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }

  // 3. Kiểm tra WebP:
  // Offset 0..3: 'RIFF' -> [0x52, 0x49, 0x46, 0x46]
  // Offset 8..11: 'WEBP' -> [0x57, 0x45, 0x42, 0x50]
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  // Các định dạng khác (SVG, GIF, EXE, PDF, HTML, v.v.) đều bị từ chối
  return null;
}

/**
 * Hàm thuần validateImage
 * Chấp nhận: File, Blob, Buffer, Uint8Array hoặc ArrayBuffer
 */
export async function validateImage(
  input: File | Blob | Uint8Array | ArrayBuffer | null | undefined,
  options: ValidateImageOptions = {}
): Promise<ValidateImageResult> {
  const maxSize = options.maxSizeBytes ?? MAX_IMAGE_SIZE_BYTES;

  if (!input) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Không tìm thấy dữ liệu tệp tải lên.",
    };
  }

  let size = 0;
  let headerBytes: Uint8Array;

  try {
    if (typeof File !== "undefined" && input instanceof File) {
      size = input.size;
      if (size === 0) {
        return {
          ok: false,
          code: "EMPTY_FILE",
          message: "Tệp tải lên rỗng (0 bytes).",
        };
      }
      if (size > maxSize) {
        return {
          ok: false,
          code: "TOO_LARGE",
          message: `Kích thước tệp vượt quá giới hạn tối đa cho phép (${Math.round(maxSize / (1024 * 1024))}MB).`,
        };
      }
      // Tối ưu bộ nhớ: Chỉ đọc đúng 12 byte đầu tiên của file
      const slice = input.slice(0, 12);
      const buffer = await slice.arrayBuffer();
      headerBytes = new Uint8Array(buffer);
    } else if (typeof Blob !== "undefined" && input instanceof Blob) {
      size = input.size;
      if (size === 0) {
        return {
          ok: false,
          code: "EMPTY_FILE",
          message: "Tệp tải lên rỗng (0 bytes).",
        };
      }
      if (size > maxSize) {
        return {
          ok: false,
          code: "TOO_LARGE",
          message: `Kích thước tệp vượt quá giới hạn tối đa cho phép (${Math.round(maxSize / (1024 * 1024))}MB).`,
        };
      }
      const slice = input.slice(0, 12);
      const buffer = await slice.arrayBuffer();
      headerBytes = new Uint8Array(buffer);
    } else if (input instanceof Uint8Array) {
      size = input.byteLength;
      if (size === 0) {
        return {
          ok: false,
          code: "EMPTY_FILE",
          message: "Tệp tải lên rỗng (0 bytes).",
        };
      }
      if (size > maxSize) {
        return {
          ok: false,
          code: "TOO_LARGE",
          message: `Kích thước tệp vượt quá giới hạn tối đa cho phép (${Math.round(maxSize / (1024 * 1024))}MB).`,
        };
      }
      headerBytes = input.subarray(0, 12);
    } else if (input instanceof ArrayBuffer) {
      size = input.byteLength;
      if (size === 0) {
        return {
          ok: false,
          code: "EMPTY_FILE",
          message: "Tệp tải lên rỗng (0 bytes).",
        };
      }
      if (size > maxSize) {
        return {
          ok: false,
          code: "TOO_LARGE",
          message: `Kích thước tệp vượt quá giới hạn tối đa cho phép (${Math.round(maxSize / (1024 * 1024))}MB).`,
        };
      }
      headerBytes = new Uint8Array(input.slice(0, 12));
    } else {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "Định dạng dữ liệu đầu vào không hợp lệ.",
      };
    }
  } catch (err) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Không thể đọc dữ liệu tệp tải lên.",
    };
  }

  // Kiểm tra Magic Bytes
  const detected = detectImageMagicBytes(headerBytes);
  if (!detected) {
    return {
      ok: false,
      code: "BAD_TYPE",
      message: "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận định dạng ảnh JPEG, PNG hoặc WebP hợp lệ (không chấp nhận SVG hay tệp giả đuôi).",
    };
  }

  return {
    ok: true,
    mimeType: detected.mimeType,
    extension: detected.extension,
    size,
  };
}
