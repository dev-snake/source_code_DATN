import iconConfig from "@/config/icons/icon-config";
import { IRecipeStep } from "@/types/recipe";
import { Button, Input, Textarea } from "@nextui-org/react";

interface InstructionsProps {
  listOfInstructions: IRecipeStep[];
  setListOfInstructions: React.Dispatch<React.SetStateAction<IRecipeStep[]>>;
}

const Instructions = ({ listOfInstructions, setListOfInstructions }: InstructionsProps) => {
  const handleAddNewInstruction = () => {
    setListOfInstructions((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        value: "",
      },
    ]);
  };
  const handleRemoveInstruction = (index: number) => {
    if (listOfInstructions.length === 1) return;
    setListOfInstructions((prev) => {
      const newInstructions = prev.filter((_, i) => i !== index);
      return newInstructions.map((item, i) => ({ ...item, step: i + 1 }));
    });
  };
  const handleUpdateInstruction = (index: number, value: string) => {
    setListOfInstructions((prev) => prev.map((item, i) => (i === index ? { ...item, value } : item)));
  };
  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
      <div className="flex items-center justify-between">
        <h5>Các bước làm bánh</h5>
        <Button isIconOnly color="secondary" onClick={handleAddNewInstruction}>
          {iconConfig.add.medium}
        </Button>
      </div>
      <div className="flex flex-col gap-y-2">
        {listOfInstructions.map((_, index) => (
          <div className="flex w-full flex-col gap-y-2" key={index}>
            <h6>Bước {_.step}</h6>
            <div className="flex items-center gap-x-2">
              <Textarea
                value={_.value}
                placeholder="Nhập thông tin hướng dẫn"
                size="lg"
                variant="bordered"
                onValueChange={(e) => handleUpdateInstruction(index, e)}
              />
              <Button
                isIconOnly
                size="lg"
                color="danger"
                variant="flat"
                onClick={() => handleRemoveInstruction(index)}
              >
                {iconConfig.xMark.base}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructions;
