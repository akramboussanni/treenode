package model

type RecaptchaVerificationPayload struct {
	Secret   string `json:"secret"`
	Response string `json:"response"`
	RemoteIP string `json:"remoteip"`
}

type RecaptchaVerificationResponse struct {
	Success      bool     `json:"success"`
	Score        float32  `json:"score"`
	Action       string   `json:"string"`
	ChallengedAt string   `json:"challenge_ts"`
	Hostname     string   `json:"hostname"`
	ErrorCodes   []string `json:"error-codes"`
}
