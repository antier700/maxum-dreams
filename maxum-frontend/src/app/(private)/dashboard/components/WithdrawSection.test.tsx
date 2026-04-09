import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WithdrawSection from "./WithdrawSection";

describe("WithdrawSection", () => {
  const props = {
    contractAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    onCopyContract: jest.fn(),
    onImportToken: jest.fn(),
    onOpenWithdraw: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders section title and contract", () => {
    render(<WithdrawSection {...props} />);
    expect(screen.getByRole("heading", { name: /Withdraw your Token/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(props.contractAddress)).toBeInTheDocument();
  });

  it("calls onOpenWithdraw when Withdraw NEXB is clicked", async () => {
    const user = userEvent.setup();
    render(<WithdrawSection {...props} />);
    await user.click(screen.getByRole("button", { name: /Withdraw NEXB/i }));
    expect(props.onOpenWithdraw).toHaveBeenCalledTimes(1);
  });

  it("calls onImportToken for import button", async () => {
    const user = userEvent.setup();
    render(<WithdrawSection {...props} />);
    await user.click(screen.getByRole("button", { name: /Click Here to Import Token/i }));
    expect(props.onImportToken).toHaveBeenCalledTimes(1);
  });
});
