import { requireAll } from "../js/utils/webpack/requireAll"

import "reset-css"

import("./vars.pcss")
import("./utils.pcss")
import("./globals.pcss")
import("./fonts.pcss")
import("./forms.pcss")

if (process.env.NODE_ENV !== "test") {
  requireAll(require.context("./typo", false, /\.(pcss|css)$/i))
  requireAll(require.context("./blocks", false, /\.(pcss|css)$/i))
}
