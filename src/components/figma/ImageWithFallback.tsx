import React, { useState } from 'react'

const FALLBACK_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement>

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const { src, alt = '', style, className = '', ...rest } = props

  const handleImageError = () => {
    setHasError(true)
  }

  if (hasError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 text-center align-middle ${className}`}
        style={{
          width: style?.width ?? 100,
          height: style?.height ?? 100,
          ...style,
        }}
      >
        <img
          src={FALLBACK_IMAGE_SRC}
          alt="Failed to load image"
          aria-label={`Could not load image: ${alt}`}
          data-original-src={src}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          {...rest}
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
      {...rest}
    />
  )
}
