// playing with way to do sticky footer with scrollable content

import TextComponent from "./text-component";

export default function TestPage() {
  return (
    <div className="flex flex-col border-2 border-blue-500 h-[calc(100vh-56px)]">
      {/* header */}
      <div className="bg-green-500">header</div>
      {/* body */}
      <div className="grow border-2 border-red-500 overflow-y-auto">
        <TextComponent />
      </div>
      {/* footer */}
      <div className="bg-blue-500">footer</div>
    </div>
  );
}
