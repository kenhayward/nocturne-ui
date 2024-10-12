export const fetchTopArtists = async (accessToken, setArtists, updateGradientColors, handleError) => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.items.length > 0) {
          const imageUrl = data.items[0].images[0]?.url;
          if (imageUrl) {
            localStorage.setItem("artistsImage", imageUrl);
            updateGradientColors(imageUrl, "artists");
          }
        }
        setArtists(data.items);
      } else {
        handleError("FETCH_TOP_ARTISTS_ERROR", response.status.toString());
      }
    } catch (error) {
      handleError("FETCH_TOP_ARTISTS_ERROR", error.message);
    }
  };