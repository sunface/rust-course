package storage

import (
	"github.com/imdotdev/im.dev/server/internal/tags"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var tagsList = []*models.Tag{
	&models.Tag{Title: "Javascript", Name: "javascript", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1607082785538/EryuLRriM.png?w=400&h=400&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "", Name: "", Icon: ""},
	&models.Tag{Title: "React", Name: "reactjs", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1513321478077/ByCWNxZMf.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Nodejs", Name: "nodejs", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1607322143407/LsbeyUL86.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Python", Name: "python", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1607321670861/lG265gIUp.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "CSS", Name: "css", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1513316949083/By6UMkbfG.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Java", Name: "java", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1534512378322/H1gM-pH4UQ.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Go", Name: "go", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1534512687168/S1D40rVLm.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "PHP", Name: "php", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1513177307594/rJ4Jba0-G.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "React Native", Name: "react-native", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/rkij45wit50lfpkbte5q/1475235386.jpg?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Angular", Name: "angular", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1513839958045/HJ0LTRdMz.jpeg?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Android", Name: "android", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/qbj34hxd8981nfdugyph/1450468271.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Machine Learning", Name: "machine-learning", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1513321644252/Sk43El-fz.png?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Developer", Name: "developer", Icon: "https://cdn.hashnode.com/res/hashnode/image/upload/v1554321431158/MqVqSHr8Q.jpeg?w=180&h=180&fit=crop&crop=entropy&auto=compress"},
	&models.Tag{Title: "Docker", Name: "docker", Icon: "https://res.cloudinary.com/practicaldev/image/fetch/s--7L1txQC1--/c_limit,f_auto,fl_progressive,q_80,w_180/https://dev-to-uploads.s3.amazonaws.com/uploads/badge/badge_image/87/docker-badge.png"},
	&models.Tag{Title: "Kubernetes", Name: "kubernetes", Icon: "https://res.cloudinary.com/practicaldev/image/fetch/s--XXaJdQCT--/c_limit,f_auto,fl_progressive,q_80,w_180/https://dev-to-uploads.s3.amazonaws.com/uploads/badge/badge_image/88/kubernetes-badge.png"},
	&models.Tag{Title: "Rust", Name: "rust", Icon: "https://res.cloudinary.com/practicaldev/image/fetch/s--4RD0-X0v--/c_limit,f_auto,fl_progressive,q_80,w_180/https://dev-to-uploads.s3.amazonaws.com/uploads/badge/badge_image/35/rust-badge.png"},
	&models.Tag{Title: "Web Development", Name: "webdev", Icon: "https://i.postimg.cc/RVP8fWFz/web-dev-logo.png"},
	&models.Tag{Title: "Testing", Name: "testing", Icon: "https://i.postimg.cc/0ygM0fzs/testing-image.png"},
	&models.Tag{Title: "VueJS", Name: "vue", Icon: "https://res.cloudinary.com/practicaldev/image/fetch/s--KflrVC4o--/c_limit,f_auto,fl_progressive,q_80,w_180/https://dev-to-uploads.s3.amazonaws.com/uploads/badge/badge_image/27/vue-sticker.png"},
	&models.Tag{Title: "Discuss", Name: "discuss", Icon: "https://i.postimg.cc/jScTwK9B/disscuss-image.png"},
	&models.Tag{Title: "News", Name: "news", Icon: "https://i.postimg.cc/yxm5MyC2/news-image.png"},
	&models.Tag{Title: "Typescript", Name: "typescript", Icon: "https://i.postimg.cc/PJTKwG0F/typescript-image.png"},
	&models.Tag{Title: "Linux", Name: "linux", Icon: "https://i.postimg.cc/BnL5tQXn/linux-image.jpg"},
	&models.Tag{Title: "Mysql", Name: "mysql", Icon: "https://i.postimg.cc/fyytFBdR/mysql-image.png"},
	&models.Tag{Title: "Flutter", Name: "flutter", Icon: "https://i.postimg.cc/dtp7D2bz/flutter-image.png"},
	&models.Tag{Title: "IOS", Name: "ios", Icon: "https://i.postimg.cc/z3ZFCsLg/ios-image.png"},
	&models.Tag{Title: "CPP", Name: "cpp", Icon: "https://res.cloudinary.com/practicaldev/image/fetch/s--lRZA1qmc--/c_limit,f_auto,fl_progressive,q_80,w_180/https://dev-to-uploads.s3.amazonaws.com/uploads/badge/badge_image/95/cpp_logo.png"},
	&models.Tag{Title: "APM", Name: "apm", Icon: "https://i.postimg.cc/8cYwcyg7/apm-image.png"},
	&models.Tag{Title: "Algorithms", Name: "algorithms", Icon: "https://i.postimg.cc/yYBQtRpC/algorithms-image.png"},
}

func initTags(u string) error {
	for _, tag := range tagsList {
		tag.Creator = u
		tags.SubmitTag(tag)
	}
	return nil
}
