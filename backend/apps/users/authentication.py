from rest_framework import authentication


class SessionAuthentication(authentication.SessionAuthentication):
    """DRF session auth that answers unauthenticated requests with 401.

    Stock SessionAuthentication has no WWW-Authenticate challenge, so DRF turns
    "not logged in" into 403. A distinct 401 lets the frontend tell
    "please log in" apart from "forbidden" or "CSRF failed".
    """

    def authenticate_header(self, request):
        return "Session"
