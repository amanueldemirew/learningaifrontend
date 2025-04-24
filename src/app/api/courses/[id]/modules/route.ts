import { NextRequest, NextResponse } from "next/server";
import { Module, Unit } from "@/services/types";

export async function GET(request: NextRequest) {
  try {
    // Use the params.id directly to extract courseId
    // Extract courseId from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const courseIdIndex = pathParts.indexOf("courses") + 1;
    const courseId =
      courseIdIndex < pathParts.length
        ? parseInt(pathParts[courseIdIndex])
        : null;

    if (!courseId || isNaN(courseId)) {
      console.error("Could not extract courseId from URL:", url.pathname);
      return NextResponse.json(
        { error: "Course ID is missing or invalid" },
        { status: 400 }
      );
    }

    // Get the authorization header from the request
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is missing" },
        { status: 401 }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Make a direct API call with the token
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const apiUrl = `${API_BASE_URL}/modules?course_id=${courseId}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Get the modules array
    let modulesArray: Module[] = [];
    if (data.items && Array.isArray(data.items)) {
      modulesArray = data.items;
    } else if (Array.isArray(data)) {
      modulesArray = data;
    } else {
      console.warn("Unexpected response format:", data);
      return NextResponse.json([]);
    }

    // Fetch units for each module
    const modulesWithUnits = await Promise.all(
      modulesArray.map(async (module) => {
        // Fetch units for this module
        const unitsUrl = `${API_BASE_URL}/units?course_id=${courseId}&module_id=${module.id}`;
        const unitsResponse = await fetch(unitsUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!unitsResponse.ok) {
          console.error(
            `Failed to fetch units for module ${module.id}:`,
            unitsResponse.status
          );
          return { ...module, units: [] };
        }

        const unitsData = await unitsResponse.json();
        let units: Unit[] = [];

        if (unitsData.items && Array.isArray(unitsData.items)) {
          units = unitsData.items;
        } else if (Array.isArray(unitsData)) {
          units = unitsData;
        }

        return { ...module, units };
      })
    );

    return NextResponse.json(modulesWithUnits);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
