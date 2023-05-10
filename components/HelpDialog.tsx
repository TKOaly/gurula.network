import { ComponentProps, HTMLAttributes, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, HelpCircle, X } from "react-feather";

export type Props = {
  onClose: () => void
  show: boolean
}

export const HelpDialog = ({ onClose, show }: Props) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const MoreInfoLink = (props: ComponentProps<"a">) => (
    <div className="mt-1.5">
      <a {...props} className="whitespace-nowrap font-semibold">{ props.children ?? 'More info (Finnish)' } <ExternalLink className="h-4 w-4 inline-block align-middle relative -top-0.5 ml-0.5" /></a>
    </div>
  );

  const handleBackdropClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (evt.target === backdropRef.current && show) {
      onClose();
    }
  };

  if (!show) {
    return null;
  }

  return createPortal(
    <div
      className="fixed overflow-y-scroll w-[100vw] h-[100vh] inset-0 flex items-center justify-center"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="md:rounded-xl text-zinc-200 p-5 flex flex-col bg-gradient-to-b shadow-2xl from-zinc-700/80 to-zinc-800/80 backdrop-blur-lg w-full h-full overflow-y-scroll md:overflow-hidden md:w-[40em] md:max-h-[90vh] md:h-auto">
        <h1 className="text-2xl font-semibold gap-3 border-b-4 border-black/25 pb-3 flex items-center">
          <HelpCircle strokeWidth={2} className="h-7 w-7" />
          Help
          <div className="grow" />
          <X className="h-7 w-7 cursor-pointer" onClick={() => onClose()} />
        </h1>
        <div className="px-2 md:overflow-y-scroll">
          <h3 className="text-xl font-semibold mt-5 mb-1">What is gurula.network?</h3>
          <p className="">
            This site, <b>gurula.network</b>, displays real-time statistics from the Ruokavälitys (RV) register system located in TKO-äly ry&apos;s student room Gurula.
          </p>
          <h3 className="text-xl font-semibold mt-5 mb-1">What is Gurula?</h3>
          <p className="">
            Gurula is the student room of computer science students of the University of Helsinki.
            The room (DK115) is located on the basement floor of the Exactum building.
            <MoreInfoLink href="https://fuksiwiki.tko-aly.fi/Gurulan_esittely" />
          </p>
          <h3 className="text-xl font-semibold mt-5 mb-1">What is Ruokavälitys?</h3>
          <p className="">
            Ruokavälitys (RV, engl. <i>snack kiosk</i>) is a service via which members of TKO-äly can purchase food, snacks and drinks from Gurula.
            Purchases are made via an electronic register system with a dedicated terminal.
            <MoreInfoLink href="https://www.tko-aly.fi/toiminta/rv" />
          </p>
          <h3 className="text-xl font-semibold mt-5 mb-1">How do I use the RV system?</h3>
          <p className="">
            Account registration, purchases and deposits are made using a dedicated terminal located in Gurula.
            Anyone with TKO-äly membership can create an account in the system.
            When making deposits to the bank account, please follow the instructions carefully.
          </p>
          <h3 className="text-xl font-semibold mt-5 mb-1">What if I do not want my purchases to be public?</h3>
          <p className="">
            Anyone can change their privacy settings by logging into the RV terminal in Gurula.
            This is done by typing <code className="bg-black/20 py-0.5 px-1.5 rounded-sm shadow-lg text-[11pt] shadow-inner">privacy</code>, pressing <code className="bg-black/20 py-0.5 px-1 rounded-sm shadow-lg text-[11pt] shadow-inner">Enter</code>, and following the directions on the screen.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
