# Requirements Document: Mobile Dev Link Header

## Introduction

The Mobile Dev Link Header is a development-only utility component that displays the current page's mobile-accessible URL using the local network IP address. This enables developers to quickly access the same page on mobile devices during local development by providing a one-click copy functionality. The component is environment-aware, rendering only in development mode, and works seamlessly across all routes including public storefront, admin CMS, and game pages.

## Glossary

- **MobileDevLinkHeader**: The main React component that renders the development header
- **LocalIP**: The IPv4 address of the development machine on the local network
- **MobileURL**: The complete URL constructed using LocalIP, port, and current pathname
- **ClipboardAPI**: Browser API for copying text to the system clipboard
- **IPDetectionAPI**: Server-side API endpoint that detects the local network IP address
- **useLocalIP**: Custom React hook that fetches and caches the local IP address
- **PrivateNetworkRange**: IPv4 address ranges reserved for private networks (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- **LoopbackAddress**: IPv4 address 127.0.0.1 used for localhost connections

## Requirements

### Requirement 1: Environment-Aware Rendering

**User Story:** As a developer, I want the mobile dev link header to only appear in development mode, so that it never appears in production builds.

#### Acceptance Criteria

1. WHEN the application runs in production environment, THE MobileDevLinkHeader SHALL return null and render nothing
2. WHEN the application runs in development environment, THE MobileDevLinkHeader SHALL render the header component
3. THE MobileDevLinkHeader SHALL check the NODE_ENV environment variable to determine the current environment
4. WHEN the environment cannot be determined, THE MobileDevLinkHeader SHALL default to not rendering

### Requirement 2: Local Network IP Detection

**User Story:** As a developer, I want the system to automatically detect my local network IP address, so that I can access the development server from mobile devices on the same network.

#### Acceptance Criteria

1. WHEN the IPDetectionAPI is called, THE System SHALL return a valid IPv4 address from the local network
2. WHEN detecting network interfaces, THE IPDetectionAPI SHALL exclude loopback addresses starting with "127."
3. WHEN multiple valid network interfaces exist, THE IPDetectionAPI SHALL prefer addresses in PrivateNetworkRange
4. WHEN no valid network interface is found, THE IPDetectionAPI SHALL return null
5. THE IPDetectionAPI SHALL use Node.js os.networkInterfaces() to access network information

### Requirement 3: Mobile URL Construction

**User Story:** As a developer, I want the system to construct a complete mobile-accessible URL, so that I can easily navigate to the current page from my mobile device.

#### Acceptance Criteria

1. WHEN constructing a MobileURL, THE System SHALL combine LocalIP, port number, and current pathname
2. THE System SHALL format the MobileURL as "http://{ip}:{port}{pathname}"
3. WHEN the LocalIP is null, THE System SHALL not construct a MobileURL
4. THE System SHALL use port 3001 as the default development port
5. WHEN the pathname changes, THE System SHALL update the MobileURL to reflect the new path

### Requirement 4: One-Click Copy Functionality

**User Story:** As a developer, I want to copy the mobile URL with one click, so that I can quickly paste it into my mobile browser.

#### Acceptance Criteria

1. WHEN the user clicks the copy button, THE System SHALL copy the MobileURL to the clipboard using ClipboardAPI
2. WHEN the copy operation succeeds, THE System SHALL display success feedback to the user
3. WHEN the copy operation fails, THE System SHALL display error feedback to the user
4. THE System SHALL clear success feedback after 2 seconds
5. THE System SHALL clear error feedback after 3 seconds
6. WHEN the ClipboardAPI is unavailable, THE System SHALL handle the error gracefully and show error feedback

### Requirement 5: IP Caching and Performance

**User Story:** As a developer, I want the IP detection to be efficient, so that it doesn't slow down page navigation or cause unnecessary network requests.

#### Acceptance Criteria

1. WHEN the useLocalIP hook is called, THE System SHALL fetch the LocalIP only once per session
2. WHEN the LocalIP has been fetched, THE useLocalIP hook SHALL return the cached value on subsequent calls
3. THE useLocalIP hook SHALL provide loading state while fetching the LocalIP
4. THE useLocalIP hook SHALL provide error state if IP detection fails
5. WHEN the component unmounts and remounts, THE System SHALL reuse the cached LocalIP value

### Requirement 6: Visual Feedback and UI Design

**User Story:** As a developer, I want the header to be small and unobtrusive, so that it doesn't interfere with testing the actual application UI.

#### Acceptance Criteria

1. THE MobileDevLinkHeader SHALL use fixed positioning at the top of the viewport
2. THE MobileDevLinkHeader SHALL display the MobileURL in a monospace font for readability
3. THE MobileDevLinkHeader SHALL include a copy button with clear labeling
4. WHEN the copy operation succeeds, THE System SHALL change the button text to indicate success
5. THE MobileDevLinkHeader SHALL use a distinct background color to differentiate it from application content
6. THE MobileDevLinkHeader SHALL have a high z-index to ensure it appears above other content

### Requirement 7: Error Handling and Graceful Degradation

**User Story:** As a developer, I want the component to fail gracefully when errors occur, so that it doesn't break the development experience.

#### Acceptance Criteria

1. WHEN the IPDetectionAPI fails, THE MobileDevLinkHeader SHALL render nothing and not display an error to the user
2. WHEN the LocalIP cannot be determined, THE MobileDevLinkHeader SHALL render nothing
3. WHEN the ClipboardAPI fails, THE System SHALL log the error to the console and show error feedback
4. WHEN network interfaces are unavailable, THE IPDetectionAPI SHALL return null without throwing an exception
5. THE System SHALL never throw unhandled exceptions that could crash the application

### Requirement 8: Cross-Route Compatibility

**User Story:** As a developer, I want the mobile dev link header to work on all pages, so that I can test any route on my mobile device.

#### Acceptance Criteria

1. WHEN integrated into the root layout, THE MobileDevLinkHeader SHALL appear on all application routes
2. WHEN the user navigates to a different page, THE System SHALL update the displayed MobileURL to match the new pathname
3. THE MobileDevLinkHeader SHALL work on public storefront pages
4. THE MobileDevLinkHeader SHALL work on admin CMS pages
5. THE MobileDevLinkHeader SHALL work on game pages and any other custom routes

### Requirement 9: API Endpoint Specification

**User Story:** As a developer, I want a reliable API endpoint for IP detection, so that the client-side component can fetch the local network IP.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint at /api/local-ip
2. WHEN the endpoint is called, THE IPDetectionAPI SHALL return a JSON response with an "ip" field
3. THE IPDetectionAPI SHALL return { ip: string | null } as the response format
4. WHEN an error occurs, THE IPDetectionAPI SHALL include an optional "error" field in the response
5. THE IPDetectionAPI SHALL execute only on the server side using Node.js APIs

### Requirement 10: Type Safety and Validation

**User Story:** As a developer, I want strong type safety, so that I can catch errors at compile time and ensure correct usage.

#### Acceptance Criteria

1. THE System SHALL define TypeScript interfaces for all component props and return types
2. THE useLocalIP hook SHALL return an object with ip, loading, and error properties
3. THE IPDetectionAPI SHALL validate that returned IP addresses match IPv4 format
4. THE constructMobileURL function SHALL validate that the port is within valid range (1-65535)
5. THE System SHALL use TypeScript strict mode for all component and hook implementations
