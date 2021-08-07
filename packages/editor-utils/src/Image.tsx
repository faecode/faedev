import React from "react"

type Props = {
  source: any
  style: any
}

function imageNominalToUrl(source: any): string {
  return `/api/imageAsset/${source.target.projectId}/${source.target.baseId}.${source.extension}`
}

export const Image = ({ source, ...others }: Props) => {
  const src =
    typeof source === "object"
      ? imageNominalToUrl(source)
      : typeof source === "string"
      ? source
      : "/images/image-placeholder.svg"

  return (
    <img
      src={src}
      alt={source?.name || ""}
      width={source?.width}
      height={source?.height}
      {...others}
    />
  )
}
