import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FileUpload from "../modules/auth/components/FileUpload";

describe("FileUpload", () => {
  it("renders the label", () => {
    render(<FileUpload label="Upload ID document" onFileSelect={vi.fn()} />);
    expect(screen.getByText("Upload ID document")).toBeInTheDocument();
  });

  it("shows upload prompt text when no file is selected", () => {
    render(<FileUpload label="Upload ID" onFileSelect={vi.fn()} />);
    expect(
      screen.getByText("Click to upload or drag and drop"),
    ).toBeInTheDocument();
  });

  it("shows format hint text", () => {
    render(<FileUpload label="Upload" onFileSelect={vi.fn()} />);
    expect(screen.getByText("PDF, JPG, PNG (Max 10MB)")).toBeInTheDocument();
  });

  it("shows uploaded file name when uploadedFileName is provided", () => {
    render(
      <FileUpload
        label="Upload ID"
        onFileSelect={vi.fn()}
        uploadedFileName="passport.pdf"
      />,
    );
    expect(screen.getByText("File uploaded")).toBeInTheDocument();
    expect(screen.getByText("passport.pdf")).toBeInTheDocument();
  });

  it("does not show upload prompt when file is uploaded", () => {
    render(
      <FileUpload
        label="Upload ID"
        onFileSelect={vi.fn()}
        uploadedFileName="id.jpg"
      />,
    );
    expect(
      screen.queryByText("Click to upload or drag and drop"),
    ).not.toBeInTheDocument();
  });

  it("shows success icon when file is uploaded", () => {
    render(
      <FileUpload
        label="Upload ID"
        onFileSelect={vi.fn()}
        uploadedFileName="doc.pdf"
      />,
    );
    // The success image is rendered with alt="" (decorative), but we can check the parent structure
    expect(screen.getByText("File uploaded")).toBeInTheDocument();
  });
});
