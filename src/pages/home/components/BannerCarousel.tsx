import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, IconButton, Skeleton } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "@/functions/getBaseURL";

type BannerItem = {
    id: number;
    title: string;
    display_order: number;
    is_external_link: boolean;
    link_url: string;
    image_url: string;
    is_active: boolean;
};

type BannerCarouselProps = {
    banners: BannerItem[];
    loading?: boolean;
};

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, loading }) => {
    const sliderRef = React.useRef<Slider | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();

    const handleClick = (banner: BannerItem) => {
        if (!banner.link_url) return;

        if (banner.is_external_link) {
            window.open(banner.link_url, "_blank", "noopener,noreferrer");
        } else {
            navigate(banner.link_url);
        }
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        fade: true,
        autoplay: true,
        autoplaySpeed: 8000,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: "ondemand" as const,
        arrows: false,
        beforeChange: (_: number, next: number) => setCurrentSlide(next),
    };

    const filteredBanners = banners
        .filter((banner) => banner.is_active)
        .sort((a, b) => a.display_order - b.display_order);

    useEffect(() => {
        setCurrentSlide(0);
        sliderRef.current?.slickGoTo(0);
    }, [banners]);

    return (
        <Box
            position='relative'
            borderRadius={4}
            overflow='hidden'
            width='100%'
            sx={{
                aspectRatio: "5 / 1",
            }}>
            {loading ? (
                <Skeleton variant='rectangular' animation='wave' width='100%' height={300} sx={{ borderRadius: 2 }} />
            ) : filteredBanners.length === 0 ? (
                <Slider ref={sliderRef} {...settings}>
                    <Box width='100%'>
                        <img
                            src={getBaseURL() + "/Uploads/public/banners/404-banner.svg"}
                            alt='Banner Fixo'
                            style={{
                                width: "100%",
                                objectFit: "cover",
                                borderRadius: 16,
                            }}
                        />
                    </Box>
                </Slider>
            ) : (
                <>
                    <Slider ref={sliderRef} {...settings}>
                        {filteredBanners.map((banner) => (
                            <Box
                                key={banner.id}
                                onClick={() => handleClick(banner)}
                                sx={{
                                    cursor: banner.link_url ? "pointer" : "default",
                                    width: "100%",
                                    aspectRatio: "5 / 1",
                                }}>
                                <img
                                    src={getBaseURL() + banner.image_url}
                                    alt={banner.title}
                                    style={{
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: 16,
                                        display: "block",
                                    }}
                                />
                            </Box>
                        ))}
                    </Slider>

                    {filteredBanners.length > 1 && (
                        <>
                            <IconButton
                                onClick={() => sliderRef.current?.slickPrev()}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 16,
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.25)",
                                    color: "#fff",
                                    zIndex: 2,
                                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.50)" },
                                }}>
                                <ArrowBackIosNew />
                            </IconButton>

                            <IconButton
                                onClick={() => sliderRef.current?.slickNext()}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 16,
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.25)",
                                    color: "#fff",
                                    zIndex: 2,
                                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.50)" },
                                }}>
                                <ArrowForwardIos />
                            </IconButton>

                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 12,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    zIndex: 2,
                                    pointerEvents: "none",
                                }}>
                                <ul
                                    style={{
                                        margin: 0,
                                        padding: 0,
                                        display: "flex",
                                        gap: 8,
                                        pointerEvents: "auto",
                                    }}>
                                    {filteredBanners.map((_, index) => (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                sliderRef.current?.slickGoTo(index);
                                                setCurrentSlide(index);
                                            }}
                                            style={{ cursor: "pointer", listStyle: "none" }}>
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    backgroundColor: currentSlide === index ? "#ffffff" : "#d4d4d4",
                                                    border: "1px solid rgba(0, 0, 0, 0.25)",
                                                    transition: "all 0.3s ease",
                                                    ...(currentSlide === index && {
                                                        boxShadow: "0 0 6px 2px rgba(255, 255, 255, 0.45)",
                                                    }),
                                                }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default BannerCarousel;
