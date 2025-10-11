import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_MARGIN,
  FRAGMENT_PADDING_BOTTOM,
} from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";

export abstract class FragmentVM extends StatementVM {
  protected heightAfterComment(origin: string): number {
    const fragmentOrigin = this.resolveFragmentOrigin(origin);
    const bodyHeight = this.fragmentBodyHeight(fragmentOrigin);

    return (
      FRAGMENT_MARGIN +
      FRAGMENT_HEADER_HEIGHT +
      bodyHeight +
      FRAGMENT_PADDING_BOTTOM +
      FRAGMENT_MARGIN
    );
  }

  protected abstract fragmentBodyHeight(fragmentOrigin: string): number;
}
