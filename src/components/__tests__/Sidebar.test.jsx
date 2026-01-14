import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../Sidebar"; // __tests__ ke ek level upar
import * as authApi from "../../api/auth"; // correct path

jest.mock("../../api/auth", () => ({
  logout: jest.fn(),
}));

describe("Sidebar Component", () => {
  test("renders sidebar header", () => {
    render(
      <MemoryRouter initialEntries={["/books"]}>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText(/Book Manager Pro/i)).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const links = [
      "Book List",
      "Create Book",
      "Doc Files",
      "Data Ingestion",
      "Smart RAG Search",
      "Overview",
      "User Management",
    ];
    links.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  test("logout button works", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutBtn);
    expect(authApi.logout).toHaveBeenCalled();
  });
});
