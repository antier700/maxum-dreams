import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WithdrawModal from "./WithdrawModal";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const VALID_MM = `0x${"c".repeat(40)}`;

describe("WithdrawModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as unknown as { ethereum?: unknown }).ethereum;
  });

  it("keeps Withdraw disabled until amount and address are valid", async () => {
    const user = userEvent.setup();
    const onWithdraw = jest.fn();

    render(
      <WithdrawModal
        show
        handleClose={jest.fn()}
        walletBalance="100"
        onWithdraw={onWithdraw}
      />
    );

    const withdrawBtn = screen.getByRole("button", { name: /^Withdraw$/i });
    expect(withdrawBtn).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Enter Amount"), "50");
    expect(withdrawBtn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/paste your receive address/i), VALID_MM);
    expect(withdrawBtn).not.toBeDisabled();
  });

  it("does not render dialog content when closed", () => {
    render(
      <WithdrawModal show={false} handleClose={jest.fn()} walletBalance="100" />
    );
    expect(screen.queryByText(/Withdraw NEXB/i)).not.toBeInTheDocument();
  });

  it("shows balance hint and calls onWithdraw with form values", async () => {
    const user = userEvent.setup();
    const onWithdraw = jest.fn();
    const handleClose = jest.fn();

    render(
      <WithdrawModal
        show
        handleClose={handleClose}
        walletBalance="250.5"
        onWithdraw={onWithdraw}
      />
    );

    expect(screen.getByText("250.5")).toBeInTheDocument();
    expect(screen.getByText(/Available balance \(in app\)/i)).toBeInTheDocument();

    const amountInput = screen.getByPlaceholderText("Enter Amount");
    const addrInput = screen.getByPlaceholderText(/paste your receive address/i);

    await user.type(amountInput, "10");
    await user.type(addrInput, VALID_MM);
    await user.click(screen.getByRole("button", { name: /^Withdraw$/i }));

    expect(onWithdraw).toHaveBeenCalledWith({
      amount: "10",
      walletAddress: VALID_MM,
    });
  });

  it("fills wallet from MetaMask when provider is available", async () => {
    const user = userEvent.setup();
    const request = jest.fn().mockResolvedValue([VALID_MM]);
    (window as unknown as { ethereum: { request: typeof request } }).ethereum = { request };

    render(<WithdrawModal show handleClose={jest.fn()} walletBalance="1" />);

    await user.click(screen.getByRole("button", { name: /Use MetaMask address/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/paste your receive address/i)).toHaveValue(VALID_MM);
    });
    expect(request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
  });
});
