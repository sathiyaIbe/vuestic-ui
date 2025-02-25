import { computed, unref, watchPostEffect, type Ref } from 'vue'

import { useDomRect } from './useDomRect'
import { useDocument } from './useDocument'
import { usePlacementAliases } from './usePlacementAliases'

import { unwrapEl } from '../utils/unwrapEl'
import { mapObject } from '../utils/map-object'

import type {
  PlacementAlignment,
  PlacementPosition,
  UsePlacementAliasesProps,
  ParsedPlacement,
} from './usePlacementAliases'

export type Offset = number | [number, number]

type Coords = { x: number, y: number }
type AlignCoords = { main: number, cross: number }

const coordsToCss = ({ x, y }: Coords) => ({ left: `${x}px`, top: `${y}px` })

const parseOffset = (offset: Offset): AlignCoords => {
  return Array.isArray(offset) ? { main: offset[0], cross: offset[1] } : { main: offset, cross: 0 }
}

const calculateContentAlignment = (align: PlacementAlignment, anchorStart: number, anchorSize: number, contentSize: number) => {
  if (align === 'start') { return anchorStart }
  if (align === 'end') { return anchorStart + anchorSize - contentSize }

  return anchorStart + (anchorSize - contentSize) / 2
}

const calculateContentCoords = (
  position: PlacementPosition,
  align: PlacementAlignment,
  anchor: DOMRect,
  content: DOMRect,
) => {
  const alignmentX = calculateContentAlignment(align, anchor.left, anchor.width, content.width)
  const alignmentY = calculateContentAlignment(align, anchor.top, anchor.height, content.height)

  switch (position) {
    case 'top': return { x: alignmentX, y: anchor.top - content.height }
    case 'left': return { y: alignmentY, x: anchor.left - content.width }
    case 'right': return { y: alignmentY, x: anchor.right }
    case 'bottom':
    default: return { x: alignmentX, y: anchor.bottom }
  }
}

const calculateOffsetCoords = (position: PlacementPosition, offset: Offset): Coords => {
  const { main, cross } = parseOffset(offset)

  switch (position) {
    case 'left': return { y: cross, x: -main }
    case 'right': return { y: cross, x: main }
    case 'top': return { y: -main, x: cross }
    case 'bottom':
    default: return { y: main, x: cross }
  }
}

/** Returns how much content overflow */
const calculateContentOverflow = (coords: Coords, content: DOMRect, viewport: DOMRect) => {
  const xMax = viewport.right
  const yMax = viewport.bottom
  const xMin = viewport.left
  const yMin = viewport.top

  return {
    top: Math.max(yMin - coords.y, 0),
    bottom: Math.max((coords.y + content.height) - yMax, 0),
    left: Math.max(xMin - coords.x, 0),
    right: Math.max((coords.x + content.width) - xMax, 0),
  }
}

const clamp = (min: number, v: number, max: number) => Math.max(Math.min(v, max), min)

const calculateClipToEdge = (coords: Coords, offsetCoords: Coords, content: DOMRect, anchor: DOMRect, viewport: DOMRect) => {
  const { top, bottom, left, right } = calculateContentOverflow(coords, content, viewport)

  // Add left overflow, sub right overflow so content always stick to edge
  const x = coords.x - right + left
  const y = coords.y - bottom + top

  const { x: offsetX, y: offsetY } = offsetCoords

  return {
    // Clamp content position near anchor, so any content edge should touch anchor edge
    x: clamp(anchor.left + offsetX - content.width, x, anchor.right + offsetX),
    y: clamp(anchor.top + offsetY - content.height, y, anchor.bottom + offsetY),
  }
}

const getAutoPlacement = (
  position: PlacementPosition,
  align: PlacementAlignment,
  coords: Coords,
  content: DOMRect,
  viewport: DOMRect,
): ParsedPlacement => {
  const overflow = calculateContentOverflow(coords, content, viewport)
  const convertPlacement = (position: PlacementPosition, align: PlacementAlignment) => ({ position, align })

  const newPlacements: Record<PlacementPosition, PlacementPosition> = {
    top: 'bottom',
    bottom: 'top',
    right: 'left',
    left: 'right',
  }

  if (!overflow[position]) { return convertPlacement(position, align) }

  // TODO: This is not recursive, if there is overflow in left and right - still will be a problem
  // Might need to use some different algorithm here
  const newPlacement = newPlacements[position]

  if (newPlacement === 'bottom' || newPlacement === 'top') {
    // cross: →
    if (overflow.left) { return convertPlacement(newPlacement, 'start') }
    if (overflow.right) { return convertPlacement(newPlacement, 'end') }
  }

  if (newPlacement === 'left' || newPlacement === 'right') {
    // cross: ↓
    if (overflow.top) { return convertPlacement(newPlacement, 'start') }
    if (overflow.bottom) { return convertPlacement(newPlacement, 'end') }
  }

  return convertPlacement(newPlacement, 'center')
}

const findFirstRelativeParent = (el: Element | null) => {
  while (el) {
    // TODO: Remove the el.style.position after fix of this issue: https://github.com/nuxt/framework/issues/3587
    // TODO: Remove from the va-dropdown.vue the inline style (position: relative)
    const positionValue = window.getComputedStyle(el).getPropertyValue('position') ||
      (el as HTMLElement).style.position

    if (positionValue === 'relative') { return el }

    el = el.parentElement
  }

  return document.body
}

export type usePopoverOptions = {
  keepAnchorWidth?: boolean,
  autoPlacement?: boolean,
  stickToEdges?: boolean,
  offset?: Offset,
  /** Root element selector */
  root?: string | HTMLElement,
  viewport?: HTMLElement,
}

/**
 * Updates `contentRef` css, make it position fixed and moves relative to `anchorRef`
 * @param anchorRef
 * @param contentRef
 * @param options make options reactive if you want popover to react on options change.
 * @param props
 */
export const useDropdown = (
  anchorRef: Ref<HTMLElement | undefined>,
  contentRef: Ref<HTMLElement | undefined>,
  options: usePopoverOptions | Ref<usePopoverOptions>,
  props: UsePlacementAliasesProps,
) => {
  const documentRef = useDocument()
  const rootRef = computed(() => {
    if (!documentRef.value) { return undefined }

    const { root } = unref(options)

    if (root) {
      let el
      if (typeof root === 'string') {
        el = documentRef.value.querySelector(root)
      } else {
        el = root
      }
      if (!el) { return documentRef.value.body }
      return findFirstRelativeParent(el)
    }

    return documentRef.value.body
  })
  const { domRect: anchorDomRect } = useDomRect(anchorRef)
  const { domRect: contentDomRect } = useDomRect(contentRef)

  const css = {
    position: 'absolute',
  }

  const { position, align } = usePlacementAliases(props)
  watchPostEffect(() => {
    if (!rootRef.value || !anchorDomRect.value || !contentDomRect.value) { return }

    const { offset, keepAnchorWidth, autoPlacement, stickToEdges } = unref(options)

    // calculate coords (x and y) of content left-top corner
    let coords = calculateContentCoords(position.value, align.value, anchorDomRect.value, contentDomRect.value)

    let offsetCoords: Coords = { x: 0, y: 0 }
    if (offset) {
      offsetCoords = calculateOffsetCoords(position.value, offset)
      coords = mapObject(coords, (c, key) => c + offsetCoords[key])
    }

    const rootRect = rootRef.value.getBoundingClientRect()
    const viewportRect = unref(options).viewport?.getBoundingClientRect() ?? rootRect

    if (autoPlacement) {
      const { position: newPosition, align: newAlign } = getAutoPlacement(position.value, align.value, coords, contentDomRect.value, viewportRect)

      if (newPosition !== position.value || newAlign !== align.value) {
        coords = calculateContentCoords(newPosition, newAlign, anchorDomRect.value, contentDomRect.value)

        if (offset) {
          offsetCoords = calculateOffsetCoords(newPosition, offset)
          coords = mapObject(coords, (c, key) => c + offsetCoords[key])
        }
      }
    }

    if (stickToEdges) {
      coords = calculateClipToEdge(coords, offsetCoords, contentDomRect.value, anchorDomRect.value, viewportRect)
    }

    coords.x -= rootRect.x + rootRef.value.clientLeft
    coords.y -= rootRect.y + rootRef.value.clientTop

    if (unwrapEl(contentRef.value)) {
      let widthCss = {}
      if (keepAnchorWidth) {
        const { width } = anchorDomRect.value
        widthCss = { width: `${width}px`, maxWidth: `${width}px` }
      }

      Object.assign(unwrapEl(contentRef.value)!.style, {
        ...css,
        ...coordsToCss(coords),
        ...widthCss,
      })
    }
  })

  return {
    anchorDomRect,
    contentDomRect,
  }
}
