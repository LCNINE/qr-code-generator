import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface TooltipBoxProps {
  children: React.ReactNode
  tooltipMessage: string | null
  className?: string
}

export function TooltipBox({ children, tooltipMessage, className }: TooltipBoxProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {tooltipMessage && (
          <TooltipContent>
            <p className={className}>{tooltipMessage}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </>
  )
}
