import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir, access } from "fs/promises";

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH!, "web/uploads");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const folderName = formData.get("folderName") as string;
    const files = formData.getAll("files") as File[];

    if (!folderName || files.length === 0) {
      return NextResponse.json(
        { error: "Folder name and files are required" },
        { status: 400 }
      );
    }

    // Create the target folder path
    const targetFolder = path.join(PHOTOS_DIR, folderName);

    // Check if folder exists, if not create it
    try {
      await access(targetFolder);
    } catch {
      // Folder doesn't exist, create it
      await mkdir(targetFolder, { recursive: true });
    }

    // Save each file
    const savedFiles = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name;
        const filePath = path.join(targetFolder, fileName);
        await writeFile(filePath, buffer);
        return fileName;
      })
    );

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading files" },
      { status: 500 }
    );
  }
}
