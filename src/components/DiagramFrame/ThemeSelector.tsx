import { useState } from "react";
import { useAtom } from "jotai";
import {
  Transition,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  Label,
  Radio,
} from "@headlessui/react";
import {
  enableScopedThemingAtom,
  themeAtom,
  themeIconDotAtom,
} from "@/store/Store";
import { TrackEvent } from "@/EventBus";
import { cn } from "@/utils";
import Icon from "../Icon/Icons";
import ThemeLegacy from "../../assets/theme/theme-legacy.svg?raw";
import ThemeCleanLight from "../../assets/theme/theme-clean-light.svg?raw";
import ThemeCleanDark from "../../assets/theme/theme-clean-dark.svg?raw";
import ThemeNeonDark from "../../assets/theme/theme-neon-dark.svg?raw";

const themes = [
  {
    name: "Legacy",
    id: "theme-default",
    icon: ThemeLegacy,
  },
  {
    name: "Clear Light",
    id: "theme-clean-light",
    icon: ThemeCleanLight,
  },
  {
    name: "Clear Dark",
    id: "theme-clean-dark",
    icon: ThemeCleanDark,
  },
  {
    name: "Neon Dark",
    id: "theme-neon",
    icon: ThemeNeonDark,
  },
];

export const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme = themes[0].id, setTheme] = useAtom(themeAtom);
  const [enableScopedTheming, setEnableScopedTheming] = useAtom(
    enableScopedThemingAtom,
  );
  const [themeIconDot, setThemeIconDot] = useAtom(themeIconDotAtom);

  const themeTrackEvent = (action: string) => {
    TrackEvent(
      {
        theme,
        enableScopedTheming,
      },
      action,
      "sequence",
    );
  };

  const openModal = () => {
    setIsOpen(true);
    setThemeIconDot("");
    themeTrackEvent("theme-open-modal");
  };
  const closeModal = () => {
    setIsOpen(false);
    themeTrackEvent("theme-close-modal");
  };
  const updateTheme = (theme: string) => {
    setTheme(theme);
    themeTrackEvent("theme-select");
  };
  const updateEnablescopeTheming = (checked: boolean) => {
    setEnableScopedTheming(checked);
    themeTrackEvent("theme-enable-scoped");
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center relative"
        onClick={openModal}
      >
        <Icon name="theme" />
        {themeIconDot && (
          <span className="dot absolute top-0 right-0 w-1 h-1 rounded-full bg-red-500"></span>
        )}
      </button>
      <Transition show={isOpen}>
        <Dialog
          className="relative z-10"
          onClick={closeModal}
          onClose={closeModal}
        >
          <TransitionChild
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                enter="duration-300 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white py-6 text-left align-middle shadow-xl transition-all">
                  <div className="px-6 w-[450px]">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Theme
                    </DialogTitle>
                    <p className="text-gray-500 text-sm">
                      Customize your UI theme
                    </p>
                    <div className="mt-4 ml-[-0.5rem] px-2 max-h-72 overflow-y-auto pb-4">
                      <RadioGroup value={theme} onChange={updateTheme}>
                        <Label className="sr-only">Server size</Label>
                        <div className="space-y-2">
                          {themes.map((t) => (
                            <Radio key={t.id} value={t.id}>
                              <div
                                className={
                                  (cn(
                                    theme === t.id
                                      ? "border-2 text-gray-900 border-primary"
                                      : "border-2 border-transparent",
                                  ),
                                  "relative flex items-center cursor-pointer rounded-lg px-4 py-3 shadow-md")
                                }
                              >
                                <div className="flex w-full items-center text-sm text-gray-900">
                                  {theme === t.id ? (
                                    <Icon
                                      name="selected-cycle"
                                      className="h-5 w-5 fill-none"
                                    />
                                  ) : (
                                    <Icon
                                      name="non-selected-cycle"
                                      className="h-5 w-5"
                                    />
                                  )}
                                  <Label
                                    as="p"
                                    className={cn(
                                      theme === t.id
                                        ? "text-gray-900"
                                        : "text-gray-900",
                                      "font-medium ml-2",
                                    )}
                                  >
                                    {t.name}
                                  </Label>
                                </div>
                                <span
                                  className="inline-block w-20 border rounded-md overflow-hidden"
                                  dangerouslySetInnerHTML={{
                                    __html: t.icon,
                                  }}
                                />
                              </div>
                            </Radio>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="pt-6 px-6 border-t flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="scopeTheming"
                      checked={enableScopedTheming}
                      onChange={(event) =>
                        updateEnablescopeTheming(event.target.checked)
                      }
                    />
                    <label htmlFor="scopeTheming" className="select-none">
                      Apply to this diagram only
                    </label>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
