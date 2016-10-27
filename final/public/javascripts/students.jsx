class CourseAttendence extends React.Component {

    constructor() {
        super();
        this.state = {courses: []};
        this.getCourses();
    }

    getCourses() {
        $.ajax({
                url: '/students/data',
                dataType: 'json',
                'Content-type': 'application/json',
                method: "GET",
                success: (res) => {
                this.setState({courses: res});
    },
        error: GameBoard.requestError
    });
    }



    //registerMac(k) {
    //    return () => {
    //        $.ajax({
    //                url: '/registermac',
    //                data: ({name:}),
    //                dataType: "text",
    //                method: "POST",
    //                success: (response) => {
    //                console.log("success");
    //                alert("good");
    //    },
    //        error: (jqXHR, textStatus, errorThrown)=> {
    //            GameBoard.requestError('Username already in Game', jqXHR);
    //        }
    //    });
    //    }
    //}


    static requestError(error, jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 409) {
            alert(error);
        }
        console.log("Ajax Error: " + textStatus, errorThrown);
    }


    render() {
        var courseList = Object.keys(this.state.courses).map((key, i) => {
                return (
            <tr key={i}>
    <td data-th="Course name">{this.state.courses[key].name}</td>
        <td data-th="Course Number">{this.state.courses[key].number}</td>
        <td data-th="Attendence">{this.state.courses[key].attendance}</td>
        </tr>
    )
    });
        return (
            <section>
                <table id="CourseAttendanceTable">
                    <colgroup>
                        <col style={{width:'20%'}}></col>
                        <col style={{width:'20%'}}></col>
                        <col style={{width:'50%'}}></col>
                        <col style={{width:'10%'}}></col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Course name</th>
                            <th>Course Number</th>
                            <th>Attendence</th>
                        </tr>
                    </thead>
                    <tbody>{courseList}</tbody>
                </table>
        </section>)
    }

}


ReactDOM.render(React.createElement(CourseAttendence), document.getElementById("courseListContainer"));
