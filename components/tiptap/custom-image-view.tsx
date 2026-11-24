'use client'

import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { useState, useEffect, useRef, type PointerEvent } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'
import Spinner from '@/components/ui/spinner'

export const CustomImageView = ({ editor, getPos, node, selected }: ReactNodeViewProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ width: number; aspectRatio: number } | null>(null)
  const drag = useRef<{
    pointerId: number
    startX: number
    startWidth: number
    aspectRatio: number
    direction: number
  } | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { src, alt, title, width, height } = node.attrs

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!src) {
        setError('No image source provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        // If it's already a full URL, use it directly
        if (src.startsWith('http')) {
          setImageUrl(src)
          setIsLoading(false)
          return
        }
        
        // For file paths, use our unified file API
        const apiUrl = `/api/files/serve?path=${encodeURIComponent(src)}`
        
        const response = await fetch(apiUrl)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Failed to fetch file: ${response.status} - ${errorData.error || 'Unknown error'}`)
        }
        
        const data = await response.json()
        if (data.fileUrl) {
          setImageUrl(data.fileUrl)
        } else {
          throw new Error('Invalid response from file API')
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching image URL:', err)
        setError(err instanceof Error ? err.message : 'Failed to load image')
        setIsLoading(false)
      }
    }

    fetchImageUrl()
  }, [src])

  function handleResizeStart(event: PointerEvent<HTMLSpanElement>, direction: number) {
    const image = imageRef.current
    if (!event.isPrimary || event.button !== 0 || drag.current || !image) return

    const { width, height } = image.getBoundingClientRect()
    if (!width || !height) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: width,
      aspectRatio: width / height,
      direction,
    }
  }

  function getDragWidth(event: PointerEvent<HTMLSpanElement>) {
    const currentDrag = drag.current
    const availableWidth = wrapperRef.current?.clientWidth
    if (currentDrag?.pointerId !== event.pointerId || !availableWidth) return null

    const delta = (event.clientX - currentDrag.startX) * currentDrag.direction
    const minimumWidth = Math.min(100, currentDrag.startWidth, availableWidth)
    return Math.round(Math.min(availableWidth, Math.max(minimumWidth, currentDrag.startWidth + delta)))
  }

  function handleResizeMove(event: PointerEvent<HTMLSpanElement>) {
    const width = getDragWidth(event)
    if (width !== null && drag.current) {
      setPreview({ width, aspectRatio: drag.current.aspectRatio })
    }
  }

  function cancelResize(event: PointerEvent<HTMLSpanElement>) {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
    setPreview(null)
  }

  function handleResizeEnd(event: PointerEvent<HTMLSpanElement>) {
    const currentDrag = drag.current
    const nextWidth = getDragWidth(event)
    cancelResize(event)
    if (!currentDrag || nextWidth === null || nextWidth === Math.round(currentDrag.startWidth)) return

    const pos = getPos()
    if (typeof pos !== 'number') return

    // Attribute steps preserve the node position and avoid triggering file deletion.
    const transaction = editor.state.tr.setNodeAttribute(pos, 'width', nextWidth)
    if (height) {
      transaction.setNodeAttribute(pos, 'height', Math.max(1, Math.round(nextWidth / currentDrag.aspectRatio)))
    }
    editor.view.dispatch(transaction)
  }

  if (isLoading) {
    return (
      <NodeViewWrapper>
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <div className="text-center flex flex-col items-center">
          <Spinner className="stroke-neutral-400 stroke-5"/>
            <p className="text-sm text-muted-foreground">Loading image...</p>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  if (error) {
    return (
      <NodeViewWrapper>
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load image</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  if (!imageUrl) {
    return (
      <NodeViewWrapper>
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No image available</p>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper ref={wrapperRef}>
      <div className="relative my-6 w-fit max-w-full" contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt ?? ''}
          title={title ?? undefined}
          className={`my-0 block h-auto max-w-full rounded-lg ${selected ? 'ring-1 ring-foreground ring-offset-4 ring-offset-background' : ''}`}
          style={{
            width: preview?.width ?? width ?? undefined,
            height: height && !width && !preview ? height : undefined,
            aspectRatio: preview
              ? String(preview.aspectRatio)
              : width && height ? `${width} / ${height}` : undefined,
          }}
        />

        {selected && editor.isEditable && ([-1, 1] as const).map((direction) => (
          <span
            key={direction}
            aria-hidden="true"
            className={`absolute top-1/2 z-10 flex h-8 w-4 -translate-y-1/2 touch-none cursor-ew-resize select-none items-center justify-center rounded-full bg-foreground/20 hover:bg-foreground/40 ${direction === -1 ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}
            onPointerDown={(event) => handleResizeStart(event, direction)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={cancelResize}
            onLostPointerCapture={cancelResize}
          >
            <span className="h-4 w-1 rounded-full bg-foreground/60" />
          </span>
        ))}
      </div>
    </NodeViewWrapper>
  )
}
