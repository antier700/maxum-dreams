jest.mock('../models/User');

const User = require('../models/User');
const { withdrawTokens } = require('../controllers/userController');

const VALID_WALLET = `0x${'a'.repeat(40)}`;

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('withdrawTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when amount is invalid', async () => {
    const req = {
      body: { amount: 0, walletAddress: VALID_WALLET },
      user: { _id: 'user1' },
    };
    const res = mockRes();
    await withdrawTokens(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringMatching(/Invalid amount/i) })
    );
    expect(User.findById).not.toHaveBeenCalled();
  });

  test('returns 400 when wallet address is missing or invalid', async () => {
    const req = {
      body: { amount: 10, walletAddress: 'not-an-address' },
      user: { _id: 'user1' },
    };
    const res = mockRes();
    await withdrawTokens(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringMatching(/wallet address/i) })
    );
  });

  test('returns 400 when insufficient balance', async () => {
    User.findById.mockResolvedValue({ _id: 'user1', availableBalance: 5 });
    const req = {
      body: { amount: 100, walletAddress: VALID_WALLET },
      user: { _id: 'user1' },
    };
    const res = mockRes();
    await withdrawTokens(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringMatching(/Insufficient/i) })
    );
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('deducts balance and returns 200 with new availableBalance', async () => {
    User.findById.mockResolvedValue({ _id: 'user1', availableBalance: 100 });
    User.findByIdAndUpdate.mockResolvedValue({
      _id: 'user1',
      availableBalance: 70,
    });

    const req = {
      body: { amount: 30, walletAddress: VALID_WALLET },
      user: { _id: 'user1' },
    };
    const res = mockRes();
    await withdrawTokens(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'user1',
      { $inc: { availableBalance: -30 } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          availableBalance: '70',
          balanceRemaining: '70',
          status: 'Pending',
          walletAddress: VALID_WALLET,
        }),
      })
    );
  });
});
