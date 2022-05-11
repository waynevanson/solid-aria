import { AriaButtonProps } from "@solid-aria/button";
import { DOMElements, ElementType } from "@solid-aria/types";
import { createId } from "@solid-aria/utils";
import { MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, JSX } from "solid-js";

import {
  createOverlayTriggerState,
  CreateOverlayTriggerStateProps,
  OverlayTriggerState
} from "./createOverlayTriggerState";

interface CreateOverlayTriggerProps extends CreateOverlayTriggerStateProps {
  /**
   * Type of overlay that is opened by the trigger.
   */
  type: MaybeAccessor<Exclude<AriaButtonProps["aria-haspopup"], boolean | undefined>>;
}

interface OverlayTriggerAria<
  TriggerElementType extends ElementType,
  OverlayElementType extends DOMElements
> {
  /**
   * Props for the trigger element.
   */
  triggerProps: Accessor<AriaButtonProps<TriggerElementType>>;

  /**
   * Props for the overlay container element.
   */
  overlayProps: Accessor<JSX.IntrinsicElements[OverlayElementType]>;

  /**
   * State for the overlay trigger, as returned by `createOverlayTriggerState`.
   */
  state: OverlayTriggerState;
}

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function createOverlayTrigger<
  TriggerElementType extends ElementType = "button",
  OverlayElementType extends DOMElements = "div"
>(props: CreateOverlayTriggerProps): OverlayTriggerAria<TriggerElementType, OverlayElementType> {
  const overlayId = createId();

  const state = createOverlayTriggerState(props);

  // Aria 1.1 supports multiple values for aria-haspopup other than just menus.
  // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
  // However, we only add it for menus for now because screen readers often
  // announce it as a menu even for other values.
  const ariaHasPopup: Accessor<AriaButtonProps["aria-haspopup"]> = createMemo(() => {
    if (props.type === "menu") {
      return true;
    }

    if (props.type === "listbox") {
      return "listbox";
    }
  });

  const triggerProps = createMemo(() => ({
    "aria-haspopup": ariaHasPopup(),
    "aria-expanded": state.isOpen(),
    "aria-controls": state.isOpen() ? overlayId : undefined
  }));

  const overlayProps = createMemo(() => ({
    id: overlayId
  }));

  return { triggerProps, overlayProps, state };
}
