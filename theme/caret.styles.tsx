import { Global, css } from "@emotion/react"

const CaretStyles = () => (
  <Global
    styles={(theme: any) => css`      
      .repo-link {
        position: fixed;
        top: 1rem;
        right: 1rem;
        height: 44px;
        width: 44px;
      }
      
      .repo-link path {
        fill: hsl(0, 0%, 10%);
        cursor: pointer;
        transition: fill 0.1s;
      }
      
      .repo-link:hover path {
        fill: hsl(0, 0%, 40%);
      }
      
      .marker {
        display: none;
        position: absolute;
        left: calc(var(--x, 0) * 1px);
        top: calc(var(--y, 0) * 1px);
        z-index: 9999;
        padding: 6px;
        border-radius: 4px;
        transform: translate(10px, -25%);
        transition: top 0.1s, left 0.1s;
      }
      
      .marker--selection {
        transform: translate(-50%, -120%);
      }
      
      /* For debugging purposes */
      textarea:focus ~ .marker--basic,
      textarea:focus ~ .marker--selection {
        display: block;
      }
     `}
  />
)

export default CaretStyles
