from rest_framework.pagination import PageNumberPagination


class AdPaginator(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'

    def get_page_size(self, request):
        page_size = super().get_page_size(request)

        if page_size not in [25, 50, 75, 100]:
            page_size = self.page_size

        return page_size