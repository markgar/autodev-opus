// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import SampleSpecsTable, {
  formatFileSize,
  type SpecItem,
} from "../components/SampleSpecsTable";

afterEach(() => {
  cleanup();
});

const sampleSpecs: SpecItem[] = [
  { name: "design.md", size: 512, lastModified: "2026-01-15T10:00:00.000Z" },
  {
    name: "requirements.md",
    size: 204800,
    lastModified: "2026-02-20T12:00:00.000Z",
  },
  {
    name: "architecture.md",
    size: 2097152,
    lastModified: "2026-03-01T08:30:00.000Z",
  },
];

describe("formatFileSize", () => {
  it("formats bytes under 1 KB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(204800)).toBe("200.0 KB");
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(2097152)).toBe("2.0 MB");
    expect(formatFileSize(1048576)).toBe("1.0 MB");
  });
});

describe("SampleSpecsTable", () => {
  it("renders all spec filenames", () => {
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <SampleSpecsTable specs={sampleSpecs} onView={onView} onDelete={onDelete} />
    );

    expect(screen.getAllByText("design.md")).toHaveLength(2); // desktop + mobile
    expect(screen.getAllByText("requirements.md")).toHaveLength(2);
    expect(screen.getAllByText("architecture.md")).toHaveLength(2);
  });

  it("displays formatted file sizes", () => {
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <SampleSpecsTable specs={sampleSpecs} onView={onView} onDelete={onDelete} />
    );

    expect(screen.getAllByText("512 B").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("200.0 KB").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2.0 MB").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onView with spec name when view button is clicked", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <SampleSpecsTable specs={sampleSpecs} onView={onView} onDelete={onDelete} />
    );

    const viewButtons = screen.getAllByRole("button", {
      name: /View design\.md/i,
    });
    await user.click(viewButtons[0]);
    expect(onView).toHaveBeenCalledWith("design.md");
  });

  it("calls onDelete with spec name when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <SampleSpecsTable specs={sampleSpecs} onView={onView} onDelete={onDelete} />
    );

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete requirements\.md/i,
    });
    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith("requirements.md");
  });

  it("renders accessible aria-labels on action buttons for each spec", () => {
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <SampleSpecsTable specs={sampleSpecs} onView={onView} onDelete={onDelete} />
    );

    for (const spec of sampleSpecs) {
      expect(
        screen.getAllByRole("button", { name: `View ${spec.name}` }).length
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByRole("button", { name: `Delete ${spec.name}` }).length
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
