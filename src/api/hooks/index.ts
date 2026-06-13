// Re-export all hooks from their respective modules for convenient importing

// Authentication & User Management Hooks
export {
  useLogin,
  useRegister,
  useForgotPassword,
  useRequestOTP,
  useSimpleRequestOTP,
  useVerifyOTP,
  useUpdateProfile,
  useChangePassword,
  useProfile,
  useDecodeToken,
  useNotifications,
  useUnreadNotifications,
  useNotificationDetail,
  useUploadImage,
  useLogout,
  useUserData,
} from './authHooks';

// Event & Chapter Management Hooks
export {
  useEvents,
  usePostEvent,
  usePostFrontEvent,
  useEventsByCustomer,
  useEventHistory,
  useEventById,
  useEventRegister,
  useMerchantRegistration,
  usePublicRegistration,
  useChapters,
  useChapterById,
  useChaptersByCustomer,
  useFrontChapters,
  useEventsByChapters,
  useEventList,
} from './eventHooks';

// Article Management Hooks
export {
  useArticles,
  useArticleCategories,
  useArticleByPermalink,
  useArticlesMutation,
  useInfiniteArticles,
  usePostArticle,
} from './articleHooks';

// Product Management Hooks
export {
  useProducts,
  useProductCategories,
  useProductSearch,
  useProductPermalink,
  useProductDetail,
  useProductCities,
  useLatestProducts,
  useBestSellerProducts,
} from './productHooks';

// Cart & Order Management Hooks
export {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useSetPickup,
  useSetPublish,
  useSetNotes,
  useDeleteItemCart,
  useOrders,
  useCheckoutOrder,
  useOrderDetail,
  useOrderTracking,
  useCancelOrder,
  useOrderByCode
} from './cartHooks';

export {
  useVoucherList,
  useSetVoucher,
  useRemoveVoucher,
} from './voucherHooks';

// General/UI Hooks
export {
  useLedger,
  useSlider,
  useSplash,
  useCityList,
} from './generalHooks';

// Shipping Hooks
export {
  useProvince,
  useCity,
  useCityByProvince,
  useDistrictByCity,
  useSetShipping,
} from './shippingHooks';

// Wishlist Hooks
export {
  useAddToWishlist,
  useIsWishlist,
  useWishlist,
  useGetWishlist,
  useRemoveFromWishlist,
  useToggleWishlist,
  useWishlistItems,
} from './wishlistHooks';
