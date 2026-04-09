import { CopyIcon } from "@/assets/icons/svgIcon";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import { CustomThrottle } from "@/constants/helper";
import toast from "react-hot-toast";

type Props = {
  contractAddress: string;
  isStaking: boolean;
  onStake: () => void;
  onCopyContract: (e?: any) => void;
};

export default function StakeTokenSection({ contractAddress, isStaking, onStake, onCopyContract }: Props) {
  const copyToClipboard = CustomThrottle((value: string | undefined) => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success("Contract Address copied to clipboard!");
    }
  }, 2000);
  return (
    <div className="investor-dashboard__stake mb-4 mb-md-5">
      <div className="contract-row">
        <div className="contract-row__field">
          <div className="contract-row__input-wrap">
            <InputField
              label="Contract Address"
              name="contractAddress"
              value={contractAddress}
              readOnly
              righttext={
                <span style={{ cursor: "pointer" }}>
                  <CopyIcon />
                </span>
              }
              righttextOnclick={() => copyToClipboard(contractAddress)}
            />
          </div>
        </div>
        <CommonButton title="Stake Token" className="contract-row__btn" onClick={onStake} disabled={isStaking} />
      </div>
    </div>
  );
}
